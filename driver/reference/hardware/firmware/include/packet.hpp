#ifndef __PACKET__
#define __PACKET__

#include <stdint.h>
#include "mcu_utils/uart.hpp"
#include "settings.hpp"

typedef struct {
    int64_t timestamp = 0;        // Unix format timestamp in seconds
    double coordinates[2] = {0};  // (latitude, longitude)
    int16_t accelerometer[3] = {0};    // (mag_x, mag_y, mag_z)
    int16_t magnetometer[3] = {0};     // (acc_x, acc_y, acc_z)
    int8_t magnetometer_asa[3] = {0};  // (asa_x, asa_y, asa_z)
    uint8_t states[2] = {0};           // (gnss state, checksum)
} packet_t;

void send_data_packet(packet_t packet);
void send_control_word(const uint8_t* word, uint8_t len);
uint8_t get_packet_checksum(int16_t* arr, uint8_t len);

#endif
