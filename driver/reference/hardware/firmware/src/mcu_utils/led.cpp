#include "mcu_utils/led.hpp"

void mcu_utils_led_blink(uint8_t pin, uint8_t t) {
    mcu_utils_gpio_mode(pin, MCU_GPIO_MODE_OUTPUT);
    for (uint8_t i = 0; i < (t > 0 ? t : 1); i++) {
        mcu_utils_gpio_low(pin);
        mcu_utils_delay_ms(50);
        mcu_utils_gpio_high(pin);
        mcu_utils_delay_ms(50);
    }
}
