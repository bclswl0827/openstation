#include "ak09911/compass.hpp"

void ak09911_read_compass(ak09911_magnetometer_t* magnetometer) {
    while (!ak09911_is_drdy()) {
        ;
    }

    uint8_t rx_buf[6];
    mcu_utils_i2c_read(AK09911_ADDRESS, AK09911_REG_HXL, rx_buf, sizeof(rx_buf));

    magnetometer->x = rx_buf[0] | (rx_buf[1] << 8);
    magnetometer->y = rx_buf[2] | (rx_buf[3] << 8);
    magnetometer->z = rx_buf[4] | (rx_buf[5] << 8);

    mcu_utils_i2c_read(AK09911_ADDRESS, AK09911_REG_ST2, NULL, 1);
}
