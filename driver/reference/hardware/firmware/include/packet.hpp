#ifndef __PACKET__
#define __PACKET__

#include <stdint.h>
#include "mcu_utils/uart.hpp"
#include "settings.hpp"

typedef struct {
    int64_t timestamp = 0;   // Unix format timestamp, from RTC in seconds
    uint8_t checksum = 0;    // Packet checksum calculated from magnetometer
    uint8_t gnss_state = 0;  // B0: GNSS time state, B1: GNSS location state)
    int16_t magnetometer[3] = {0};  // (2 cofficients, x axis, y axis)
    float coordinates[2] = {0};     // (GNSS latitude, GNSS longitude)
} packet_t;

void send_data_packet(packet_t packet);
void send_control_word(const uint8_t* word, uint8_t len);
uint8_t get_packet_checksum(int16_t* arr, uint8_t len);

#endif
