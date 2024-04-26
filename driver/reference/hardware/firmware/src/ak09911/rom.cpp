#include "ak09911/rom.hpp"

void ak09911_read_rom(ak09911_magnetometer_t* magnetometer) {
    ak09911_start(AK09911_MODE_FUSE_ROM);

    uint8_t rx_buf[3];
    mcu_utils_i2c_read(AK09911_ADDRESS, AK09911_REG_ASAX, rx_buf,
                       sizeof(rx_buf));

    for (uint8_t i = 0; i < sizeof(rx_buf); i++) {
        magnetometer->asa[i] = rx_buf[i];
    }

    mcu_utils_i2c_read(AK09911_ADDRESS, AK09911_REG_ST2, NULL, sizeof(rx_buf));
}
