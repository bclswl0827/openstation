#include "gnss/timestamp.hpp"

uint8_t gnss_is_leap_year(uint8_t year) {
    return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
}

uint8_t gnss_get_days(uint8_t year, uint8_t month) {
    static const int days[12] = {31, 28, 31, 30, 31, 30,
                                 31, 31, 30, 31, 30, 31};
    if (month == 2 && gnss_is_leap_year(year))
        return 29;
    return days[month - 1];
}

int64_t gnss_get_timestamp(gnss_time_t* time) {
    uint16_t year = 2000 + time->year;
    int64_t days = 0;

    for (uint16_t y = 1970; y < year; ++y) {
        days += gnss_is_leap_year(y) ? 366 : 365;
    }

    for (uint8_t m = 1; m < time->month; ++m) {
        days += gnss_get_days(year, m);
    }

    days += time->date - 1;
    return days * 86400LL + time->hour * 3600 + time->minute * 60 +
           time->second;
}
