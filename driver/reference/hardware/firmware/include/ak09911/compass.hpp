#ifndef __AK09911_COMPASS__
#define __AK09911_COMPASS__

#include <stdint.h>
#include "ak09911/types.hpp"
#include "ak09911/utils.hpp"
#include "mcu_utils/i2c.hpp"

void ak09911_read_compass(ak09911_magnetometer_t* magnetometer);

#endif
