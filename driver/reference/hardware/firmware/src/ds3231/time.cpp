#include "ds3231/time.hpp"

void ds3231_get_time(ds3231_time_t* time) {
    uint8_t data[7];
    mcu_utils_i2c_read(DS3231_ADDRESS, 0x00, data, 7);

    time->second = ds3231_bcd2dec(data[0]);
    time->minute = ds3231_bcd2dec(data[1]);
    time->hour = ds3231_bcd2dec(data[2]);
    time->day = ds3231_bcd2dec(data[3]);
    time->date = ds3231_bcd2dec(data[4]);
    time->month = ds3231_bcd2dec(data[5]);
    time->year = ds3231_bcd2dec(data[6]);
}

void ds3231_set_time(ds3231_time_t* time) {
    uint8_t data[7];

    data[0] = ds3231_dec2bcd(time->second);
    data[1] = ds3231_dec2bcd(time->minute);
    data[2] = ds3231_dec2bcd(time->hour);
    data[3] = ds3231_dec2bcd(time->day);
    data[4] = ds3231_dec2bcd(time->date);
    data[5] = ds3231_dec2bcd(time->month);
    data[6] = ds3231_dec2bcd(time->year);

    mcu_utils_i2c_write(DS3231_ADDRESS, 0x00, data, 7);
}
