#include "mcu_utils/delay.hpp"

void mcu_utils_delay_ms(uint32_t ms, uint8_t rtos) {
    if (rtos) {
        vTaskDelay(ms / portTICK_PERIOD_MS);
    } else {
        delay(ms);
    }
}

void mcu_utils_delay_us(uint32_t us, uint8_t rtos) {
    if (rtos) {
        uint32_t ticks;
        uint32_t told, tnow, reload, tcnt = 0;

        reload = SysTick->LOAD;
        ticks = us * (SystemCoreClock / 1000000);
        told = SysTick->VAL;

        while (1) {
            tnow = SysTick->VAL;
            if (tnow != told) {
                if (tnow < told) {
                    tcnt += told - tnow;
                } else {
                    tcnt += reload - tnow + told;
                }
                told = tnow;
                if (tcnt >= ticks) {
                    break;
                }
            }
        }
    } else {
        delayMicroseconds(us);
    }
}
