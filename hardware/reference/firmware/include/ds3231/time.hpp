#ifndef __DS3231_TIME__
#define __DS3231_TIME__

#include <stdint.h>
#include "ds3231/types.hpp"
#include "ds3231/utils.hpp"

#define DS3231_ADDRESS 0x68

void ds3231_get_time(ds3231_time_t* time);
void ds3231_set_time(ds3231_time_t* time);
int64_t ds3231_get_timestamp(ds3231_time_t* time);

#endif
