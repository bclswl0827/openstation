#ifndef __GNSS_TIMESTAMP__
#define __GNSS_TIMESTAMP__

#include <stdint.h>
#include "gnss/types.hpp"

int64_t gnss_get_timestamp(gnss_time_t* time);

#endif
