#include "mcu_utils/reset.hpp"

void mcu_utils_system_reset() {
    NVIC_SystemReset();
}
