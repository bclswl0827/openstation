#include "ds3231/time.hpp"

void ds3231_get_time(ds3231_time_t* time) {
    uint8_t data[7];
    mcu_utils_i2c_read(DS3231_ADDRESS, 0x00, data, 7);

    time->second = ds3231_bcd2dec(data[0]);
    time->minute = ds3231_bcd2dec(data[1]);
    time->hour = ds3231_bcd2dec(data[2]);
    time->mday = ds3231_bcd2dec(data[4]);
    time->month = ds3231_bcd2dec(data[5]);
    time->year = ds3231_bcd2dec(data[6]);

    tm timeinfo = {0};
    timeinfo.tm_year = 100 + time->year;
    timeinfo.tm_mon = time->month - 1;
    timeinfo.tm_mday = time->mday;
    mktime(&timeinfo);
    time->wday = timeinfo.tm_wday == 0 ? 7 : timeinfo.tm_wday;
}

void ds3231_set_time(ds3231_time_t* time) {
    tm timeinfo = {0};
    timeinfo.tm_year = 100 + time->year;
    timeinfo.tm_mon = time->month - 1;
    timeinfo.tm_mday = time->mday;
    mktime(&timeinfo);
    time->wday = timeinfo.tm_wday == 0 ? 7 : timeinfo.tm_wday;

    uint8_t data[7];
    data[0] = ds3231_dec2bcd(time->second);
    data[1] = ds3231_dec2bcd(time->minute);
    data[2] = ds3231_dec2bcd(time->hour);
    data[3] = ds3231_dec2bcd(time->wday);
    data[4] = ds3231_dec2bcd(time->mday);
    data[5] = ds3231_dec2bcd(time->month);
    data[6] = ds3231_dec2bcd(time->year);

    mcu_utils_i2c_write(DS3231_ADDRESS, 0x00, data, 7);
}

int64_t ds3231_get_timestamp(ds3231_time_t* time) {
    tm timeinfo;
    timeinfo.tm_year = 100 + time->year;
    timeinfo.tm_mon = time->month - 1;
    timeinfo.tm_mday = time->mday;
    timeinfo.tm_wday = time->wday;
    timeinfo.tm_hour = time->hour;
    timeinfo.tm_min = time->minute;
    timeinfo.tm_sec = time->second;
    timeinfo.tm_isdst = -1;

    return mktime(&timeinfo);
}
