#ifndef __MCU_UTILS_DELAY__
#define __MCU_UTILS_DELAY__

#include <Arduino.h>
#include <stdint.h>

void mcu_utils_delay_ms(uint32_t ms);
void mcu_utils_delay_us(uint32_t us);

#endif
