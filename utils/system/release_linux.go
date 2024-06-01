package system

import (
	"syscall"
)

func int8ToStr[T uint8 | int8](arr []T) string {
	b := make([]byte, 0, len(arr))
	for _, v := range arr {
		if v == 0x00 {
			break
		}
		b = append(b, byte(v))
	}
	return string(b)
}

func GetRelease() (string, error) {
	var uname syscall.Utsname
	err := syscall.Uname(&uname)
	if err != nil {
		return "", err
	}

	return int8ToStr(uname.Release[:]), nil
}
