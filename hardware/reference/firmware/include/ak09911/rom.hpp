#ifndef __AK09911_ROM__
#define __AK09911_ROM__

#include <stdint.h>
#include "ak09911/types.hpp"
#include "ak09911/utils.hpp"
#include "mcu_utils/i2c.hpp"

void ak09911_read_rom(ak09911_magnetometer_t* magnetometer);

#endif
