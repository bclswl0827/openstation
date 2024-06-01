#include "modules/checksum.h"

uint8_t get_checksum(int length, ...) {
    va_list args;
    uint8_t checksum = 0;
    uint8_t num;

    va_start(args, length);

    for (int i = 0; i < length; i++) {
        num = va_arg(args, int);
        checksum ^= num;
    }

    va_end(args);

    return checksum;
}
