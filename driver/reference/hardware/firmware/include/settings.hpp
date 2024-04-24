#ifndef __SETTINGS__
#define __SETTINGS__

#define MCU_PIN_STATE LED_BUILTIN
#define MCU_UART_BAUDRATE 115200
#define GNSS_UART_BAUDRATE 57600

const uint8_t RESET_WORD = 0x61;

const uint8_t SYNC_WORD[] = {
    0xFC,
    0x1B,
};
const uint8_t ACK_WORD[] = {
    0xFC,
    0x2B,
};

#endif
