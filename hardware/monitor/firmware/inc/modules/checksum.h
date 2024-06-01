#ifndef __MODULE_CHECKSUM_H
#define __MODULE_CHECKSUM_H

#ifndef __SDCC
#error "This header file must be used for SDCC compiler !"
#endif

#include <stdarg.h>
#include <stdint.h>

uint8_t get_checksum(int count, ...);

#endif
