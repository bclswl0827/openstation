#ifndef __DS3231_UTILS__
#define __DS3231_UTILS__

#include <stdint.h>
#include "mcu_utils/i2c.hpp"

void ds3231_init();
uint8_t ds3231_bcd2dec(uint8_t bcd);
uint8_t ds3231_dec2bcd(uint8_t dec);

#endif
