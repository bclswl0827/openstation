#include "ak09911/utils.hpp"
#include "ds3231/utils.hpp"
#include "gnss/parse.hpp"
#include "gnss/utils.hpp"
#include "mcu_utils/delay.hpp"
#include "mcu_utils/led.hpp"
#include "mcu_utils/uart.hpp"
#include "mcu_utils/uart2.hpp"
#include "packet.hpp"
#include "settings.hpp"

void setup() {
    ds3231_init();
    ak09911_init();
    gnss_init(GNSS_UART_BAUDRATE);
    mcu_utils_uart_init(MCU_UART_BAUDRATE);
    mcu_utils_led_blink(MCU_PIN_STATE, 5);
}

void loop() {
    gnss_sentence_t sentence;
    if (gnss_get_sentences(&sentence)) {
        gnss_padding_sentence(sentence.rmc);
        gnss_padding_sentence(sentence.gga);

        gnss_time_t time;
        gnss_location_t location;
        gnss_parse_rmc(&location, &time, sentence.rmc);
        gnss_parse_gga(&location, &time, sentence.gga);

        Serial.println((char*)sentence.rmc);
        Serial.println((char*)sentence.gga);
        Serial.println("");

        Serial.print(time.year);
        Serial.print("/");
        Serial.print(time.month);
        Serial.print("/");
        Serial.print(time.date);
        Serial.print(" ");
        Serial.print("Time: ");
        Serial.print(time.hour);
        Serial.print(":");
        Serial.print(time.minute);
        Serial.print(":");
        Serial.print(time.second);
        Serial.print(" ");
        Serial.print("Latitude: ");
        Serial.print(location.latitude, 6);
        Serial.print(" Longitude: ");
        Serial.print(location.longitude, 6);
        Serial.print(" Altitude: ");
        Serial.println(location.altitude, 6);
        Serial.println("");
    }
}
