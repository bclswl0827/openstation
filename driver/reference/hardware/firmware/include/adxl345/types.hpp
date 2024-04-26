#ifndef __ADXL345_TYPES__
#define __ADXL345_TYPES__

#include <stdint.h>

#define ADXL345_ADDRESS 0x53

typedef struct {
    int16_t x = 0;
    int16_t y = 0;
    int16_t z = 0;
} adxl345_accelerometer_t;

#endif
