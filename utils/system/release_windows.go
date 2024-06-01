package system

import (
	"fmt"
	"syscall"
)

func GetRelease() (string, error) {
	ver, err := syscall.GetVersion()
	if err != nil {
		return "", err
	}
	major := ver & 0xFF
	minor := (ver >> 8) & 0xFF
	build := (ver >> 16)

	return fmt.Sprintf("%d.%d (Build %d)", major, minor, build), nil
}
