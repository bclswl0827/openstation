package system

import (
	"github.com/shirou/gopsutil/host"
)

func GetHostname() (string, error) {
	info, err := host.Info()
	if err != nil {
		return "", err
	}

	hostname := info.Hostname
	return hostname, nil
}
