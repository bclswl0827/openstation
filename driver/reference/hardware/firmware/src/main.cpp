#include "FreeRTOS.h"
#include "semphr.h"
#include "task.h"

#include "ak09911/compass.hpp"
#include "ak09911/rom.hpp"
#include "ak09911/types.hpp"
#include "ak09911/utils.hpp"

#include "gnss/parse.hpp"
#include "gnss/types.hpp"
#include "gnss/utils.hpp"

#include "mcu_utils/delay.hpp"
#include "mcu_utils/led.hpp"
#include "mcu_utils/uart.hpp"

#include "packet.hpp"
#include "settings.hpp"

#define DATA_PACKET_SEND_INTERVAL 100
#define READ_COUNT_FOR_AVAERAGE 5

ak09911_magnetometer_t magnetometer;
SemaphoreHandle_t magnetometer_mutex;

gnss_location_t gnss_location;
SemaphoreHandle_t gnss_location_mutex;

gnss_time_t gnss_time;
SemaphoreHandle_t gnss_time_mutex;

static TaskHandle_t handle_read_peripherals = NULL;
void read_peripherals(void* pvParameters) {
    ak09911_read_rom(&magnetometer);
    ak09911_start(AK09911_MODE_CONT_100HZ);

    while (1) {
        int32_t magnetometer_read_sum_x_y_z[3] = {0};
        int32_t accelerometer_read_sum_x_y_z[3] = {0};

        ak09911_magnetometer_t temp_magnetometer;
        for (uint8_t i = 0; i < READ_COUNT_FOR_AVAERAGE; i++) {
            ak09911_read_compass(&temp_magnetometer);
            magnetometer_read_sum_x_y_z[0] += temp_magnetometer.x;
            magnetometer_read_sum_x_y_z[1] += temp_magnetometer.y;
            magnetometer_read_sum_x_y_z[2] += temp_magnetometer.z;
        }

        if (xSemaphoreTake(magnetometer_mutex, portMAX_DELAY) == pdTRUE) {
            magnetometer.x =
                magnetometer_read_sum_x_y_z[0] / READ_COUNT_FOR_AVAERAGE;
            magnetometer.y =
                magnetometer_read_sum_x_y_z[1] / READ_COUNT_FOR_AVAERAGE;
            magnetometer.z =
                magnetometer_read_sum_x_y_z[2] / READ_COUNT_FOR_AVAERAGE;
            xSemaphoreGive(magnetometer_mutex);
        }
    }
}

static TaskHandle_t handle_read_gnss = NULL;
void read_gnss(void* pvParameters) {
    uint8_t rmc_sentence[GNSS_SENTENCE_BUFER_SIZE];

    while (1) {
        if (gnss_get_sentence(rmc_sentence, GNSS_SENTENCE_TYPE_RMC)) {
            gnss_padding_sentence(rmc_sentence);
            gnss_location_t temp_gnss_location;
            gnss_time_t temp_gnss_time;
            gnss_parse_rmc(&temp_gnss_location, &temp_gnss_time, rmc_sentence);

            if (xSemaphoreTake(gnss_location_mutex, portMAX_DELAY) == pdTRUE) {
                gnss_location = temp_gnss_location;
                xSemaphoreGive(gnss_location_mutex);
            }
            if (xSemaphoreTake(gnss_time_mutex, portMAX_DELAY) == pdTRUE) {
                gnss_time = temp_gnss_time;
                xSemaphoreGive(gnss_time_mutex);
            }
        }
    }
}

static TaskHandle_t handle_send_packet = NULL;
void send_packet(void* pvParameters) {
    packet_t packet;

    uint8_t packet_checksum = 0;
    uint8_t gnss_state = 0;

    while (1) {
        if (xSemaphoreTake(magnetometer_mutex, portMAX_DELAY) == pdTRUE) {
            packet.magnetometer_asa[0] = magnetometer.asa[0];
            packet.magnetometer_asa[1] = magnetometer.asa[1];
            packet.magnetometer_asa[2] = magnetometer.asa[2];
            packet.magnetometer[0] = magnetometer.x;
            packet.magnetometer[1] = magnetometer.y;
            packet.magnetometer[2] = magnetometer.z;
            packet_checksum = get_packet_checksum(
                packet.magnetometer,
                sizeof(packet.magnetometer) / sizeof(packet.magnetometer[0]));
            xSemaphoreGive(magnetometer_mutex);
        }

        if (xSemaphoreTake(gnss_location_mutex, portMAX_DELAY) == pdTRUE) {
            packet.timestamp = gnss_get_timestamp(&gnss_time);
            packet.coordinates[0] = gnss_location.latitude;
            packet.coordinates[1] = gnss_location.longitude;
            gnss_state =
                gnss_location.is_valid << 1 | gnss_time.is_valid & 0x01;
            xSemaphoreGive(gnss_location_mutex);
        }

        packet.states[0] = gnss_state;
        packet.states[1] = packet_checksum;

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

    magnetometer_mutex = xSemaphoreCreateMutex();
    gnss_location_mutex = xSemaphoreCreateMutex();
    gnss_time_mutex = xSemaphoreCreateMutex();

    if (magnetometer_mutex == NULL || gnss_location_mutex == NULL ||
        gnss_time_mutex == NULL) {
        mcu_utils_led_blink(MCU_PIN_STATE, 0, 0);
    }

    xTaskCreate(read_peripherals, "read_peripherals", configMINIMAL_STACK_SIZE,
                NULL, tskIDLE_PRIORITY, &handle_read_peripherals);
    xTaskCreate(read_gnss, "read_gnss", configMINIMAL_STACK_SIZE * 4, NULL,
                tskIDLE_PRIORITY, &handle_read_gnss);
    xTaskCreate(send_packet, "send_packet", configMINIMAL_STACK_SIZE, NULL,
                tskIDLE_PRIORITY, &handle_send_packet);

    vTaskStartScheduler();
}

void loop() {
    ;
}
