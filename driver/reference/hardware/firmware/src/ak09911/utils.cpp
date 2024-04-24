#include "ak09911/utils.hpp"

void ak09911_reset() {
    uint8_t tx_buf[1] = {0x01};
    mcu_utils_i2c_write(AK09911_ADDRESS, AK09911_REG_CNTL3, tx_buf,
                        sizeof(tx_buf));
}

void ak09911_init() {
    mcu_utils_i2c_init();
    ak09911_reset();
}

void ak09911_sleep() {
    uint8_t tx_buf[1] = {0x00};
    mcu_utils_i2c_write(AK09911_ADDRESS, AK09911_REG_CNTL2, tx_buf,
                        sizeof(tx_buf));
}

void ak09911_start(uint8_t mode) {
    ak09911_sleep();
    uint8_t tx_buf[1] = {mode};
    mcu_utils_i2c_write(AK09911_ADDRESS, AK09911_REG_CNTL2, tx_buf,
                        sizeof(tx_buf));
}

uint8_t ak09911_is_drdy() {
    uint8_t rx_buf[1];
    mcu_utils_i2c_read(AK09911_ADDRESS, AK09911_REG_ST1, rx_buf,
                       sizeof(rx_buf));
    mcu_utils_i2c_read(AK09911_ADDRESS, AK09911_REG_ST2, NULL, 1);
    return (rx_buf[0] & 0x01) != 0;
}
