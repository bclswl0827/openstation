#ifndef __FRAMEWORK_DIGITAL__H
#define __FRAMEWORK_DIGITAL__H

#ifndef __SDCC
#error "This header file must be used for SDCC compiler !"
#endif

#include <reg52.h>
#include <stdint.h>
#include "framework/config.h"

#define LOW 0
#define HIGH 1

#define OUTPUT 0
#define INPUT 1
#define INPUT_PULLUP 2

#define __GET_STATE(port, pin) (port >> pin) & 0x01
#define __SET_STATE(port, pin, state) \
    (port = state ? (port | (1 << pin)) : (port & ~(1 << pin)))

uint8_t digitalRead(uint8_t pinNum);
void pinMode(uint8_t pinNum, uint8_t mode);
void digitalWrite(uint8_t pinNum, uint8_t state);
uint8_t shiftIn(uint8_t dataPin, uint8_t clockPin, uint8_t bitOrder);
void shiftOut(uint8_t dataPin, uint8_t clockPin, uint8_t bitOrder, uint8_t val);

#endif
