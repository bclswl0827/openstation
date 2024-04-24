#include "gnss/utils.hpp"

void gnss_init(uint32_t baudrate) {
    mcu_utils_uart2_init(baudrate);
}

uint8_t gnss_padding_sentence(uint8_t* str_buf) {
    uint8_t str_len = strlen((char*)str_buf);
    uint8_t new_str[GNSS_SENTENCE_BUFER_SIZE];
    uint8_t new_len = 0;

    for (uint8_t i = 0; i < str_len; i++) {
        new_str[new_len++] = str_buf[i];
        if (str_buf[i] == ',' && i < str_len - 1 && str_buf[i + 1] == ',') {
            new_str[new_len++] = GNSS_SENTENCE_PADDING_CHAR;
        }
    }

    memccpy(str_buf, new_str, '\0', new_len);
    return new_len;
}

uint8_t gnss_get_sentences(gnss_sentence_t* sentence) {
    if (mcu_utils_uart2_hasdata()) {
        bool has_gga = false;
        bool has_rmc = false;

        while (1) {
            uint8_t line_buf[GNSS_SENTENCE_BUFER_SIZE];
            uint8_t line_idx = 0;

            uint8_t ch = mcu_utils_uart2_readch();
            for (; ch != '\n' && line_idx <= UINT8_MAX;
                 ch = mcu_utils_uart2_readch()) {
                if (ch >= 32 && ch <= 126) {
                    line_buf[line_idx] = ch;
                    line_idx++;
                }
            }
            line_buf[line_idx] = '\0';

            if (gnss_check_checksum(line_buf)) {
                if (strstr((char*)line_buf, "GGA")) {
                    has_gga = true;
                    memccpy(sentence->gga, line_buf, '\0', line_idx);
                } else if (strstr((char*)line_buf, "RMC")) {
                    has_rmc = true;
                    memccpy(sentence->rmc, line_buf, '\0', line_idx);
                }
            }

            if (has_gga && has_rmc) {
                return 1;
            }
        }

        return 0;
    }

    return 0;
}

uint8_t gnss_check_checksum(uint8_t* str_buf) {
    const char* start = strchr((char*)str_buf, '$');
    const char* end = strchr(start, '*');

    if (start && end) {
        uint8_t checksum = 0;
        for (const char* ch = start + 1; ch < end; ch++) {
            checksum ^= *ch;
        }

        uint32_t messageChecksum;
        sscanf(end + 1, "%x", &messageChecksum);
        return checksum == messageChecksum;
    }

    return 0;
}
