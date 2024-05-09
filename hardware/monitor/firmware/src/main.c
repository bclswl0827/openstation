#include <Arduino.h>
#include "modules/lcd1602.h"

#define FIEMWARE_NAME "OpenStation....."
#define FIEMWARE_VERSION "FWVER: v0.0.2"

#define SYNC_WORD 0xFF
#define ACK_WORD 0xEE
#define NACK_WORD 0xDD

#define CLEAR_CMD 0x00
#define PRINT_CMD 0x01
#define RESET_CMD 0x02

#define LED_POWER 25
#define LED_PING 24
#define LED_BUSY 23
#define LED_ERROR 22

void set_ping(uint8_t val) {
    digitalWrite(LED_PING, val);
}

void setup_led(uint8_t val) {
    digitalWrite(LED_POWER, HIGH);
    digitalWrite(LED_BUSY, val & 0x01);
    digitalWrite(LED_ERROR, val & 0x02);
}

void setup_lcd() {
    delay(500);
    LCD1602Init();
    delay(500);
    LCD1602Clear();
    delay(500);
}

void setup_serial() {
    Serial_begin(9600);
    Serial_write(ACK_WORD);
}

void display_release() {
    LCD1602GotoXY(0, 0);
    LCD1602Print(FIEMWARE_NAME);
    LCD1602GotoXY(1, 0);
    LCD1602Print(FIEMWARE_VERSION);
    delay(1000);
    LCD1602Clear();
}

void setup() {
    setup_lcd();
    set_ping(LOW);
    display_release();
    setup_led(0x00);
    setup_serial();
}

void loop() {
    int8_t led_ping = INT8_MAX;

    while (1) {
        if (Serial_available() && Serial_read() == SYNC_WORD) {
            uint8_t cmd = Serial_read();
            if (cmd == RESET_CMD) {
                setup();
                Serial_write(ACK_WORD);
            } else if (cmd == CLEAR_CMD) {
                setup_lcd();
                Serial_write(ACK_WORD);
            } else if (cmd == PRINT_CMD) {
                uint8_t x = Serial_read();
                uint8_t y = Serial_read();
                uint8_t ch = Serial_read();
                uint8_t led = Serial_read();
                LCD1602Draw(x, y, ch);
                setup_led(led);
                Serial_write(ACK_WORD);
            }
        }

        set_ping(led_ping-- > 0 ? HIGH : LOW);
    }
}
