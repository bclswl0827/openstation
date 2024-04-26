#ifndef __ADXL345_ACCELERATION__
#define __ADXL345_ACCELERATION__

#include <stdint.h>
#include "adxl345/instance.hpp"
#include "adxl345/types.hpp"

extern ADXL345 adxl;

void adxl345_read_acceleration(adxl345_accelerometer_t* accelerometer);

#endif
