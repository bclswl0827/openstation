#include "FreeRTOS.h"
#include "semphr.h"
#include "task.h"

#include "ak09911/compass.hpp"
#include "ak09911/rom.hpp"
#include "ak09911/types.hpp"
#include "ak09911/utils.hpp"

#include "ds3231/time.hpp"
#include "ds3231/types.hpp"

#include "gnss/parse.hpp"
#include "gnss/types.hpp"
#include "gnss/utils.hpp"

#include "mcu_utils/delay.hpp"
#include "mcu_utils/led.hpp"
#include "mcu_utils/uart.hpp"

#include "packet.hpp"
#include "settings.hpp"

#define DATA_PACKET_SEND_INTERVAL 100
#define CPMPASS_READ_COUNT_FACTOR_FOR_AVERAGE 10

ak09911_magnetometer_t magnetometer;
ds3231_time_t rtc_time;

gnss_location_t gnss_location;
gnss_time_t gnss_time;

SemaphoreHandle_t rtc_time_mutex;

static TaskHandle_t handle_read_peripherals = NULL;
void read_peripherals(void* pvParameters) {
    ak09911_read_rom(&magnetometer);
    ak09911_start(AK09911_MODE_CONT_100HZ);

    while (1) {
        int32_t compass_read_sum_x_y[2] = {0};

        ak09911_magnetometer_t temp_magnetometer;
        for (uint8_t i = 0; i < CPMPASS_READ_COUNT_FACTOR_FOR_AVERAGE; i++) {
            ak09911_read_compass(&temp_magnetometer);
            compass_read_sum_x_y[0] += temp_magnetometer.x;
            compass_read_sum_x_y[1] += temp_magnetometer.y;
        }

        magnetometer.x =
            compass_read_sum_x_y[0] / CPMPASS_READ_COUNT_FACTOR_FOR_AVERAGE;
        magnetometer.y =
            compass_read_sum_x_y[1] / CPMPASS_READ_COUNT_FACTOR_FOR_AVERAGE;

        if (xSemaphoreTake(rtc_time_mutex, portMAX_DELAY) == pdTRUE) {
            ds3231_get_time(&rtc_time);
            xSemaphoreGive(rtc_time_mutex);
        }
    }
}

static TaskHandle_t handle_read_gnss = NULL;
void read_gnss(void* pvParameters) {
    uint8_t has_rtc_time_set = 0;
    uint8_t rmc_sentence[GNSS_SENTENCE_BUFER_SIZE];

    while (1) {
        if (gnss_get_sentence(rmc_sentence, "RMC")) {
            gnss_padding_sentence(rmc_sentence);
            gnss_parse_rmc(&gnss_location, &gnss_time, rmc_sentence);

            if ((!has_rtc_time_set && gnss_time.is_valid) ||
                (gnss_time.minute % 5 == 0 && gnss_time.second == 0 &&
                 gnss_time.is_valid)) {
                if (xSemaphoreTake(rtc_time_mutex, portMAX_DELAY) == pdTRUE) {
                    rtc_time.year = gnss_time.year;
                    rtc_time.month = gnss_time.month;
                    rtc_time.mday = gnss_time.mday;
                    rtc_time.hour = gnss_time.hour;
                    rtc_time.minute = gnss_time.minute;
                    rtc_time.second = gnss_time.second;

                    ds3231_set_time(&rtc_time);
                    if (!has_rtc_time_set) {
                        has_rtc_time_set = 1;
                    }
                    xSemaphoreGive(rtc_time_mutex);
                }
            }
        }
    }
}

static TaskHandle_t handle_send_packet = NULL;
void send_packet(void* pvParameters) {
    packet_t packet;

    while (1) {
        packet.gnss_state = gnss_location.is_valid << 1 | gnss_time.is_valid;
        packet.coordinates[0] = gnss_location.latitude;
        packet.coordinates[1] = gnss_location.longitude;

        int16_t magnetometer_coef =
            magnetometer.coef[1] << 8 | magnetometer.coef[0];
        packet.magnetometer[0] = magnetometer_coef;
        packet.magnetometer[1] = magnetometer.x;
        packet.magnetometer[2] = magnetometer.y;

        packet.checksum = get_packet_checksum(packet.magnetometer,
                                              sizeof(packet.magnetometer) / 2);

        packet.timestamp = ds3231_get_timestamp(&rtc_time);

        send_control_word(SYNC_WORD, sizeof(SYNC_WORD));
        send_data_packet(packet);

        mcu_utils_uart_flush();
        mcu_utils_delay_ms(DATA_PACKET_SEND_INTERVAL, 1);
    }
}

void setup() {
    mcu_utils_i2c_init();
    ak09911_init();
    gnss_init(GNSS_UART_BAUDRATE);

    mcu_utils_uart_init(MCU_UART_BAUDRATE);
    mcu_utils_led_blink(MCU_PIN_STATE, 5, 0);

    rtc_time_mutex = xSemaphoreCreateMutex();
    if (rtc_time_mutex == NULL) {
        mcu_utils_led_blink(MCU_PIN_STATE, 0, 0);
    }

    xTaskCreate(read_peripherals, "read_peripherals", configMINIMAL_STACK_SIZE,
                NULL, tskIDLE_PRIORITY, &handle_read_peripherals);
    xTaskCreate(read_gnss, "read_gnss", configMINIMAL_STACK_SIZE, NULL,
                tskIDLE_PRIORITY, &handle_read_gnss);
    xTaskCreate(send_packet, "send_packet", configMINIMAL_STACK_SIZE, NULL,
                tskIDLE_PRIORITY, &handle_send_packet);

    vTaskStartScheduler();
}

void loop() {
    ;
}
