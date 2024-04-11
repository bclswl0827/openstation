#ifndef __MODULE_GNSS_LC760Z_H
#define __MODULE_GNSS_LC760Z_H

#ifndef __SDCC
#error "This header file must be used for SDCC compiler !"
#endif

#include <stdint.h>

#include "framework/wire.h"

#define AK09911_ADDRESS 0x0D

typedef struct {
    float coord[3];
    int64_t timestamp;
} gnss_t;

#endif
