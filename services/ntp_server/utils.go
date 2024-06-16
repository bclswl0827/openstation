package ntp_server

import (
	"strconv"
	"strings"
)

func splitAddr(addr string) (string, int, error) {
	strArr := strings.Split(addr, ":")
	ip := strArr[0]
	port := strArr[1]
	p, err := strconv.Atoi(port)
	return ip, p, err
}

func isDataValid(req []byte) bool {
	l := req[0] >> 6
	v := (req[0] << 2) >> 5
	m := (req[0] << 5) >> 5
	if (l == LI_NO_WARNING) || (l == LI_ALARM_CONDITION) {
		if (v >= VN_FIRST) && (v <= VN_LAST) {
			if m == MODE_CLIENT {
				return true
			}
		}
	}
	return false
}

func intToBytes(i int64) []byte {
	var b = make([]byte, 4)
	h1 := i >> 24
	h2 := (i >> 16) - (h1 << 8)
	h3 := (i >> 8) - (h1 << 16) - (h2 << 8)
	h4 := byte(i)
	b[0] = byte(h1)
	b[1] = byte(h2)
	b[2] = byte(h3)
	b[3] = byte(h4)
	return b
}
