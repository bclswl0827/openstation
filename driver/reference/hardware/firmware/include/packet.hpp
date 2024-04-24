#ifndef __PACKET__
#define __PACKET__

#include <stdint.h>
#include "mcu_utils/uart.hpp"
#include "settings.hpp"

typedef struct {
    float coordinates[3];     // (latitude, longitude, altitude)
    int16_t magnetometer[3];  // (2 cofficients, x axis, y axis, checksum)
    int64_t timestamp;        // Unix format timestamp, from RTC in milliseconds
} packet_t;

void send_data_packet(packet_t packet);
void send_control_word(const uint8_t* word, uint8_t len);
uint8_t get_packet_checksum(int16_t* arr, uint8_t len);

#endif
