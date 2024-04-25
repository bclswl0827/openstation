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

    strncpy((char*)str_buf, (char*)new_str, new_len);
    str_buf[new_len] = '\0';

    return new_len;
}

uint8_t gnss_get_sentence(uint8_t* str_buf, const char* keyword) {
    uint8_t line_buf[GNSS_SENTENCE_BUFER_SIZE];
    uint8_t line_idx = 0;

    for (uint8_t ch = mcu_utils_uart2_readch();
         ch != '\n' && line_idx < UINT8_MAX;) {
        if (mcu_utils_uart2_hasdata()) {
            if (ch >= 32 && ch <= 126) {
                line_buf[line_idx] = ch;
                line_idx++;
            }
            ch = mcu_utils_uart2_readch();
        }
    }

    if (gnss_check_checksum(line_buf)) {
        if (strstr((char*)line_buf, keyword)) {
            strncpy((char*)str_buf, (char*)line_buf, line_idx);
            str_buf[line_idx] = '\0';
            return 1;
        }
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

        uint8_t messageChecksum = 0;
        uint8_t checksumChar_1 = *(end + 1);
        if (checksumChar_1 >= '0' && checksumChar_1 <= '9') {
            messageChecksum += (checksumChar_1 - '0') << 4;
        } else if (checksumChar_1 >= 'A' && checksumChar_1 <= 'F') {
            messageChecksum += (10 + checksumChar_1 - 'A') << 4;
        } else if (checksumChar_1 >= 'a' && checksumChar_1 <= 'f') {
            messageChecksum += (10 + checksumChar_1 - 'a') << 4;
        }

        uint8_t checksumChar_2 = *(end + 2);
        if (checksumChar_2 >= '0' && checksumChar_2 <= '9') {
            messageChecksum += (checksumChar_2 - '0');
        } else if (checksumChar_2 >= 'A' && checksumChar_2 <= 'F') {
            messageChecksum += (10 + checksumChar_2 - 'A');
        } else if (checksumChar_2 >= 'a' && checksumChar_2 <= 'f') {
            messageChecksum += (10 + checksumChar_2 - 'a');
        }

        return checksum == messageChecksum;
    }

    return 0;
}