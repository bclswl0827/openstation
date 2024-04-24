#include "mcu_utils/delay.hpp"

void mcu_utils_delay_ms(uint32_t ms) {
    delay(ms);
}

void mcu_utils_delay_us(uint32_t us) {
    delayMicroseconds(us);
}
