#include <Arduino.h>

#include "modules/ak09911.h"

#define RESET_CMD 0x61

const uint8_t SYNC_WORD[] = {
    0xFC,
    0x1B,
};
const uint8_t ACK_WORD[] = {
    0xFC,
    0x2B,
};

typedef struct {
    int16_t Data[3];
    uint8_t Checksum;
} packet_t;

uint8_t get_checksum(int16_t* array, uint8_t len) {
    uint8_t checksum = 0;

    for (uint8_t i = 0; i < len; i++) {
        uint8_t* bytes = (uint8_t*)&array[i];

        for (uint8_t j = 0; j < sizeof(int16_t); j++) {
            checksum ^= bytes[j];
        }
    }

    return checksum;
}

void init(magnetometer_t* magnetometer) {
    AK09911Init();
    AK09911ReadROM(magnetometer);
    AK09911Start(AK09911_MODE_CONT_100HZ);
}

void setup() {
    Serial_begin(57600);
}

void loop() {
    magnetometer_t magnetometer;
    init(&magnetometer);

    packet_t packet;
    packet.Data[0] = magnetometer.coef[0] | magnetometer.coef[1] << 8;
    const uint8_t packetDataLen = sizeof(packet.Data) / sizeof(int16_t);

    while (1) {
        if (Serial_available() && Serial_read() == RESET_CMD) {
            for (uint8_t i = 0; i < sizeof(ACK_WORD); i++) {
                init(&magnetometer);
                Serial_write(ACK_WORD[i]);
            }

            return;
        }

        AK09911ReadCompass(&magnetometer);

        packet.Data[1] = magnetometer.x;
        packet.Data[2] = magnetometer.y;
        packet.Checksum = get_checksum(packet.Data, packetDataLen);

        for (uint8_t i = 0; i < sizeof(SYNC_WORD); i++) {
            Serial_write(SYNC_WORD[i]);
        }

        for (uint8_t i = 0; i < packetDataLen; i++) {
            for (uint8_t j = 0; j < sizeof(int16_t); j++) {
                Serial_write(((uint8_t*)&packet.Data[i])[j]);
            }
        }

        Serial_write(packet.Checksum);
    }
}
