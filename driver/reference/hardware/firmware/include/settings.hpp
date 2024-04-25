#ifndef __SETTINGS__
#define __SETTINGS__

#define MCU_PIN_STATE LED_BUILTIN
#define MCU_UART_BAUDRATE 115200
#define GNSS_UART_BAUDRATE 9600

const uint8_t SYNC_WORD[] = {
    0xFF,
    0x00,
    0xFF,
};

#endif
