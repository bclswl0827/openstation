#include "adxl345/utils.hpp"

void adxl345_init() {
    adxl.powerOn();
    adxl.setRangeSetting(8);
}
