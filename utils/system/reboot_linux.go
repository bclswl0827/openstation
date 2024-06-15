package system

import "os/exec"

func Reboot() error {
	return exec.Command("/bin/sh", "-c", "sudo reboot").Run()
}
