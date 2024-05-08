#include "packet.hpp"

void send_data_packet(packet_t packet) {
    uint8_t* packet_bytes = (uint8_t*)&packet;
    for (uint8_t i = 0; i < sizeof(packet_t); i++) {
        mcu_utils_uart_writech(packet_bytes[i]);
    }
}

uint8_t get_packet_checksum(int16_t* arr, uint8_t len) {
    uint8_t checksum = 0;

    for (uint8_t i = 0; i < len; i++) {
        uint8_t* bytes = (uint8_t*)&arr[i];

        for (uint8_t j = 0; j < sizeof(int16_t); j++) {
            checksum ^= bytes[j];
        }
    }

    return checksum;
}

void send_control_word(const uint8_t* word, uint8_t len) {
    for (uint8_t i = 0; i < len; i++) {
        mcu_utils_uart_writech(word[i]);
    }
}
