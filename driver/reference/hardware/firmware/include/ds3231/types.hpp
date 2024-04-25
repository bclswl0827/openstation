#ifndef __DS3231_TYPES__
#define __DS3231_TYPES__

#include <stdint.h>
#include <time.h>

typedef struct {
    uint8_t year = 0;
    uint8_t month = 0;
    uint8_t mday = 0;
    uint8_t wday = 0;
    uint8_t hour = 0;
    uint8_t minute = 0;
    uint8_t second = 0;
} ds3231_time_t;

#endif
