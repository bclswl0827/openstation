#include "adxl345/acceleration.hpp"

void adxl345_read_acceleration(adxl345_accelerometer_t* accelerometer) {
    int x, y, z;
    adxl.readAccel(&x, &y, &z);
    accelerometer->x = (int16_t)x;
    accelerometer->y = (int16_t)y;
    accelerometer->z = (int16_t)z;
}
