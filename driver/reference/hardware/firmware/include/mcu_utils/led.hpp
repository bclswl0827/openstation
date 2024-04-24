#ifndef __MCU_UTILS_INIT__
#define __MCU_UTILS_INIT__

#include <Arduino.h>
#include <stdint.h>
#include "mcu_utils/delay.hpp"
#include "mcu_utils/gpio.hpp"

void mcu_utils_led_blink(uint8_t pin, uint8_t t);

#endif
