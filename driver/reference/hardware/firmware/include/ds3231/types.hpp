#ifndef __DS3231_TYPES__
#define __DS3231_TYPES__

#include <stdint.h>

typedef struct {
    uint8_t year = 0;
    uint8_t month = 0;
    uint8_t date = 0;
    uint8_t day = 0;
    uint8_t hour = 0;
    uint8_t minute = 0;
    uint8_t second = 0;
} ds3231_time_t;

#endif
