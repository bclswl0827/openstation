#include "ds3231/utils.hpp"

void ds3231_init() {
    mcu_utils_i2c_init();
}

uint8_t ds3231_bcd2dec(uint8_t bcd) {
    return (bcd / 16 * 10) + (bcd % 16);
}

uint8_t ds3231_dec2bcd(uint8_t dec) {
    return (dec / 10 * 16) + (dec % 10);
}
