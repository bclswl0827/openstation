#include "gnss/parse.hpp"

void gnss_parse_rmc(gnss_location_t* location,
                    gnss_time_t* time,
                    uint8_t* str_buf) {
    uint8_t str_len = strlen((char*)str_buf);
    char buffer[str_len];
    memcpy(buffer, str_buf, str_len);

    char* token = strtok(buffer, ",");
    for (uint8_t i = 0; token != NULL; i++) {
        if (i == 1 && *token != GNSS_SENTENCE_PADDING_CHAR) {
            int32_t result = atoi(token);
            time->hour = result / 10000;
            time->minute = (result / 100) % 100;
            time->second = result % 100;
        } else if (i == 3 && *token != GNSS_SENTENCE_PADDING_CHAR) {
            double result = atof(token);
            uint8_t deg = result / 100;
            double min = result - deg * 100;
            double lat_deg = deg + min / 60.0;
            token = strtok(NULL, ",");
            i++;
            if (*token == 'S') {
                lat_deg = -lat_deg;
            }
            location->latitude = lat_deg;
        } else if (i == 5 && *token != GNSS_SENTENCE_PADDING_CHAR) {
            double result = atof(token);
            uint8_t deg = result / 100;
            double min = result - deg * 100;
            double lng_deg = deg + min / 60.0;
            token = strtok(NULL, ",");
            i++;
            if (*token == 'W') {
                lng_deg = -lng_deg;
            }
            location->longitude = lng_deg;
        } else if (i == 9 && *token != GNSS_SENTENCE_PADDING_CHAR) {
            int32_t result = atoi(token);
            time->date = result / 10000;
            time->month = (result / 100) % 100;
            time->year = result % 100;
        }

        token = strtok(NULL, ",");
    }
}

void gnss_parse_gga(gnss_location_t* location,
                    gnss_time_t* time,
                    uint8_t* str_buf) {
    uint8_t str_len = strlen((char*)str_buf);
    char buffer[str_len];
    memcpy(buffer, str_buf, str_len);

    char* token = strtok(buffer, ",");
    for (uint8_t i = 0; token != NULL; i++) {
        if (i == 1 && *token != GNSS_SENTENCE_PADDING_CHAR) {
            int32_t result = atoi(token);
            time->hour = result / 10000;
            time->minute = (result / 100) % 100;
            time->second = result % 100;
        } else if (i == 2 && *token != GNSS_SENTENCE_PADDING_CHAR) {
            double result = atof(token);
            uint8_t deg = result / 100;
            double min = result - deg * 100;
            double lat_deg = deg + min / 60.0;
            token = strtok(NULL, ",");
            i++;
            if (*token == 'S') {
                lat_deg = -lat_deg;
            }
            location->latitude = lat_deg;
        } else if (i == 4 && *token != GNSS_SENTENCE_PADDING_CHAR) {
            double result = atof(token);
            uint8_t deg = result / 100;
            double min = result - deg * 100;
            double lng_deg = deg + min / 60.0;
            token = strtok(NULL, ",");
            i++;
            if (*token == 'W') {
                lng_deg = -lng_deg;
            }
            location->longitude = lng_deg;
        } else if (i == 9 && *token != GNSS_SENTENCE_PADDING_CHAR) {
            location->altitude = atof(token);
        }

        token = strtok(NULL, ",");
    }
}
