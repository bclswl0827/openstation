#include <Arduino.h>

#include "modules/checksum.h"
#include "modules/lcd1602.h"
#include "modules/version.h"

#define START_SCREEN "Device Started!"

#define SYNC_WORD 0xFF
#define ACK_WORD 0xEE
#define NACK_WORD 0xDD
#define DUMMY_WORD 0xCC

#define CLEAR_CMD 0x00
#define PRINT_CMD 0x01
#define RESET_CMD 0x02
#define VERNO_CMD 0x03

#define LED_POWER 25
#define LED_PING 24
#define LED_BUSY 23
#define LED_ERROR 22

void setup_led(uint8_t val) {
    if (val == DUMMY_WORD) {
        return;
    }

    pinMode(LED_POWER, OUTPUT);
    digitalWrite(LED_POWER, HIGH);
    pinMode(LED_BUSY, OUTPUT);
    digitalWrite(LED_BUSY, val & 0x01);
    pinMode(LED_ERROR, OUTPUT);
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
    char version[] = VERSION;

    LCD1602GotoXY(0, 0);
    LCD1602Print(START_SCREEN);

    LCD1602GotoXY(0, 1);
    LCD1602Print(version);

    delay(500);
    LCD1602Clear();
}

void setup_ping() {
    TMOD &= 0xF0;
    TMOD |= 0x01;
    TH0 = 0x00;
    TL0 = 0x00;
    TR0 = 0x01;
    pinMode(LED_PING, OUTPUT);
    digitalWrite(LED_PING, LOW);
}

void ping_routine(uint8_t interval) {
    static uint8_t timer0Count;
    if (TF0 == 0x01) {
        TF0 = 0x00;
        if (timer0Count++ >= interval) {
            timer0Count = 0;
            uint8_t led_state = digitalRead(LED_PING);
            digitalWrite(LED_PING, led_state ? LOW : HIGH);
        }
    }
}

void setup() {
    setup_lcd();
    setup_led(0x00);
    setup_ping();
    print_release();
    setup_serial();
}

void loop() {
    while (1) {
        uint8_t has_data = Serial_available();
        if (has_data && Serial_read() == SYNC_WORD) {
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
            } else if (cmd == VERNO_CMD) {
                uint8_t recv_checksum = Serial_read();
                uint8_t calc_checksum = get_checksum(2, SYNC_WORD, cmd);
                if (calc_checksum == recv_checksum) {
                    char version[] = VERSION;
                    Serial_write(ACK_WORD);
                    Serial_println(version);
                } else {
                    Serial_write(NACK_WORD);
                }
            } else {
                Serial_write(NACK_WORD);
            }
        }

        ping_routine(has_data ? 15 : 80);
    }
}
