#ifndef __AK09911_UTILS__
#define __AK09911_UTILS__

#include <stdint.h>
#include "ak09911/types.hpp"
#include "mcu_utils/i2c.hpp"

void ak09911_reset();
void ak09911_init();
void ak09911_sleep();
void ak09911_start(uint8_t mode);
uint8_t ak09911_is_drdy();

#endif
