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

#define READ_COUNT_FOR_AVERAGE 10
#define DATA_PACKET_INTERVAL 100

typedef struct {
    SemaphoreHandle_t i2c_bus_mutex;
    ak09911_magnetometer_t magnetometer;
    SemaphoreHandle_t magnetometer_mutex;
    ds3231_time_t rtc_time;
    SemaphoreHandle_t rtc_time_mutex;
    gnss_time_t gnss_time;
    SemaphoreHandle_t gnss_time_mutex;
    gnss_location_t gnss_location;
    SemaphoreHandle_t gnss_location_mutex;
} global_task_parameters_t;

void read_peripherals(void* pvParameters) {
    global_task_parameters_t* params = (global_task_parameters_t*)pvParameters;

    while (1) {
        if (xSemaphoreTake(params->i2c_bus_mutex, portMAX_DELAY) == pdTRUE) {
            int32_t magnetometer_sum_x_y_z[3] = {0};

            for (uint8_t i = 0; i < READ_COUNT_FOR_AVERAGE; i++) {
                ak09911_magnetometer_t temp_magnetometer;
                ak09911_read_compass(&temp_magnetometer);
                magnetometer_sum_x_y_z[0] += temp_magnetometer.x;
                magnetometer_sum_x_y_z[1] += temp_magnetometer.y;
                magnetometer_sum_x_y_z[2] += temp_magnetometer.z;
            }

            if (xSemaphoreTake(params->magnetometer_mutex, portMAX_DELAY) ==
                pdTRUE) {
                params->magnetometer.x =
                    magnetometer_sum_x_y_z[0] / READ_COUNT_FOR_AVERAGE;
                params->magnetometer.y =
                    magnetometer_sum_x_y_z[1] / READ_COUNT_FOR_AVERAGE;
                params->magnetometer.z =
                    magnetometer_sum_x_y_z[2] / READ_COUNT_FOR_AVERAGE;
                xSemaphoreGive(params->magnetometer_mutex);
            }

            xSemaphoreGive(params->i2c_bus_mutex);
        }

        if (xSemaphoreTake(params->gnss_time_mutex, portMAX_DELAY) == pdTRUE) {
            uint8_t is_gnss_time_valid = params->gnss_time.is_valid;
            if (xSemaphoreTake(params->rtc_time_mutex, portMAX_DELAY) ==
                pdTRUE) {
                if (!is_gnss_time_valid) {
                    if (xSemaphoreTake(params->i2c_bus_mutex, portMAX_DELAY) ==
                        pdTRUE) {
                        ds3231_get_time(&(params->rtc_time));
                        xSemaphoreGive(params->i2c_bus_mutex);
                    }
                }

                xSemaphoreGive(params->rtc_time_mutex);
            }

            xSemaphoreGive(params->gnss_time_mutex);
        }
    }
}

void read_gnss(void* pvParameters) {
    global_task_parameters_t* params = (global_task_parameters_t*)pvParameters;

    while (1) {
        uint8_t rmc_sentence[GNSS_SENTENCE_BUFFER_SIZE];
        uint8_t has_valid_sentence =
            gnss_get_sentence(rmc_sentence, GNSS_SENTENCE_TYPE_RMC);

        if (has_valid_sentence) {
            gnss_padding_sentence(rmc_sentence);
            gnss_location_t temp_gnss_location;
            gnss_time_t temp_gnss_time;
            gnss_parse_rmc(&temp_gnss_location, &temp_gnss_time, rmc_sentence);

            if (xSemaphoreTake(params->rtc_time_mutex, portMAX_DELAY) ==
                pdTRUE) {
                if (temp_gnss_time.is_valid) {
                    ds3231_time_t temp_rtc_time;
                    temp_rtc_time.year = temp_gnss_time.year;
                    temp_rtc_time.month = temp_gnss_time.month;
                    temp_rtc_time.mday = temp_gnss_time.mday;
                    temp_rtc_time.hour = temp_gnss_time.hour;
                    temp_rtc_time.minute = temp_gnss_time.minute;
                    temp_rtc_time.second = temp_gnss_time.second;

                    if (xSemaphoreTake(params->i2c_bus_mutex, portMAX_DELAY) ==
                        pdTRUE) {
                        ds3231_set_time(&temp_rtc_time);
                        xSemaphoreGive(params->i2c_bus_mutex);
                    }
                }

                xSemaphoreGive(params->rtc_time_mutex);
            }

            if (xSemaphoreTake(params->gnss_time_mutex, portMAX_DELAY) ==
                pdTRUE) {
                params->gnss_time = temp_gnss_time;
                xSemaphoreGive(params->gnss_time_mutex);
            }

            if (xSemaphoreTake(params->gnss_location_mutex, portMAX_DELAY) ==
                pdTRUE) {
                params->gnss_location = temp_gnss_location;
                xSemaphoreGive(params->gnss_location_mutex);
            }
        }
    }
}

void send_packet(void* pvParameters) {
    global_task_parameters_t* params = (global_task_parameters_t*)pvParameters;

    packet_t packet;
    uint8_t packet_checksum = 0;
    uint8_t gnss_state = 0;
    uint8_t has_init = 0;

    while (1) {
        if (xSemaphoreTake(params->magnetometer_mutex, portMAX_DELAY) ==
            pdTRUE) {
            packet.magnetometer_asa[0] = params->magnetometer.asa[0];
            packet.magnetometer_asa[1] = params->magnetometer.asa[1];
            packet.magnetometer_asa[2] = params->magnetometer.asa[2];
            packet.magnetometer[0] = params->magnetometer.x;
            packet.magnetometer[1] = params->magnetometer.y;
            packet.magnetometer[2] = params->magnetometer.z;
            packet_checksum = get_packet_checksum(
                packet.magnetometer,
                sizeof(packet.magnetometer) / sizeof(packet.magnetometer[0]));
            xSemaphoreGive(params->magnetometer_mutex);
        }

        if (xSemaphoreTake(params->gnss_location_mutex, portMAX_DELAY) ==
            pdTRUE) {
            if (params->gnss_time.is_valid) {
                packet.timestamp = gnss_get_timestamp(&(params->gnss_time));
            }
            packet.coordinates[0] = params->gnss_location.latitude;
            packet.coordinates[1] = params->gnss_location.longitude;
            gnss_state = (params->gnss_location.is_valid << 1) |
                         (params->gnss_time.is_valid & 0x01);
            xSemaphoreGive(params->gnss_location_mutex);
        }

        if (xSemaphoreTake(params->rtc_time_mutex, portMAX_DELAY) == pdTRUE) {
            uint8_t is_gnss_time_valid = gnss_state & 0x01;
            has_init = params->rtc_time.has_init;
            if (!is_gnss_time_valid && has_init) {
                packet.timestamp = ds3231_get_timestamp(&(params->rtc_time));
            }
            xSemaphoreGive(params->rtc_time_mutex);
        }

        packet.states[0] = gnss_state;
        packet.states[1] = packet_checksum;

        if (has_init) {
            send_control_word(SYNC_WORD, sizeof(SYNC_WORD));
            send_data_packet(packet);
            mcu_utils_uart_flush();
            mcu_utils_delay_ms(DATA_PACKET_INTERVAL, 1);
        }
    }
}

void setup() {
    static global_task_parameters_t params;

    params.magnetometer_mutex = xSemaphoreCreateMutex();
    params.rtc_time_mutex = xSemaphoreCreateMutex();
    params.gnss_location_mutex = xSemaphoreCreateMutex();
    params.gnss_time_mutex = xSemaphoreCreateMutex();
    params.i2c_bus_mutex = xSemaphoreCreateMutex();

    if (params.magnetometer_mutex == NULL || params.rtc_time_mutex == NULL ||
        params.gnss_location_mutex == NULL || params.gnss_time_mutex == NULL ||
        params.i2c_bus_mutex == NULL) {
        mcu_utils_led_blink(MCU_PIN_STATE, 0, 0);
    }

    mcu_utils_i2c_init();
    ak09911_init();
    ak09911_read_rom(&(params.magnetometer));
    ak09911_start(AK09911_MODE_CONT_100HZ);

    gnss_init(GNSS_UART_BAUDRATE);
    mcu_utils_uart_init(MCU_UART_BAUDRATE);

    static TaskHandle_t handle_read_peripherals = NULL;
    xTaskCreate(read_peripherals, "read_peripherals", configMINIMAL_STACK_SIZE,
                &params, tskIDLE_PRIORITY, &handle_read_peripherals);

    static TaskHandle_t handle_read_gnss = NULL;
    xTaskCreate(read_gnss, "read_gnss", configMINIMAL_STACK_SIZE * 4, &params,
                tskIDLE_PRIORITY, &handle_read_gnss);

    static TaskHandle_t handle_send_packet = NULL;
    xTaskCreate(send_packet, "send_packet", configMINIMAL_STACK_SIZE, &params,
                tskIDLE_PRIORITY, &handle_send_packet);

    mcu_utils_led_blink(MCU_PIN_STATE, 5, 0);
    vTaskStartScheduler();
}

void loop() {
    ;
}
