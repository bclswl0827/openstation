#include <Arduino.h>

#include "modules/checksum.h"
#include "modules/lcd1602.h"

#define FIEMWARE_NAME "OpenStation....."
#define FIEMWARE_VERSION "FWVER: v0.1.4"

#define SYNC_WORD 0xFF
#define ACK_WORD 0xEE
#define NACK_WORD 0xDD
#define DUMMY_WORD 0xCC

#define CLEAR_CMD 0x00
#define PRINT_CMD 0x01
#define RESET_CMD 0x02

#define LED_POWER 25
#define LED_PING 24
#define LED_BUSY 23
#define LED_ERROR 22

void setup_ping(uint8_t val) {
    digitalWrite(LED_PING, val);
}

void setup_led(uint8_t val) {
    if (val == DUMMY_WORD) {
        return;
    }
    digitalWrite(LED_POWER, HIGH);
    digitalWrite(LED_BUSY, val & 0x01);
    digitalWrite(LED_ERROR, val & 0x02);
}

void setup_lcd() {
    delay(500);
    LCD1602Init();
    LCD1602Clear();
}

void setup_serial() {
    Serial_begin(9600);
    Serial_write(ACK_WORD);
}

void print_release() {
    LCD1602GotoXY(0, 0);
    LCD1602Print(FIEMWARE_NAME);
    LCD1602GotoXY(1, 0);
    LCD1602Print(FIEMWARE_VERSION);
    delay(300);
    LCD1602Clear();
}

void setup() {
    setup_lcd();
    setup_led(0x00);
    setup_ping(HIGH);
    print_release();
    setup_serial();
}

void loop() {
    int8_t led_ping = INT8_MAX;

    while (1) {
        if (Serial_available() && Serial_read() == SYNC_WORD) {
            uint8_t cmd = Serial_read();
            if (cmd == RESET_CMD) {
                uint8_t recv_checksum = Serial_read();
                uint8_t calc_checksum = get_checksum(2, SYNC_WORD, cmd);
                if (calc_checksum == recv_checksum) {
                    setup();
                    Serial_write(ACK_WORD);
                } else {
                    Serial_write(NACK_WORD);
                }
            } else if (cmd == CLEAR_CMD) {
                uint8_t recv_checksum = Serial_read();
                uint8_t calc_checksum = get_checksum(2, SYNC_WORD, cmd);
                if (calc_checksum == recv_checksum) {
                    setup_lcd();
                    Serial_write(ACK_WORD);
                } else {
                    Serial_write(NACK_WORD);
                }
            } else if (cmd == PRINT_CMD) {
                uint8_t x = Serial_read();
                uint8_t y = Serial_read();
                uint8_t ch = Serial_read();
                uint8_t led = Serial_read();
                uint8_t recv_checksum = Serial_read();
                uint8_t calc_checksum =
                    get_checksum(6, SYNC_WORD, cmd, x, y, ch, led);
                if (calc_checksum == recv_checksum) {
                    setup_led(led);
                    LCD1602Draw(x, y, ch);
                    Serial_write(ACK_WORD);
                } else {
                    Serial_write(NACK_WORD);
                }
            } else {
                Serial_write(NACK_WORD);
            }
        }

        setup_ping(led_ping-- > 0 ? HIGH : LOW);
    }
}
