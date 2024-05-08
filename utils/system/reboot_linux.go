package system

import (
	"syscall"
)

func Reboot() error {
	return syscall.Reboot(syscall.LINUX_REBOOT_CMD_POWER_OFF)
}
