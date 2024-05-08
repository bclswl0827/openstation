package system

import (
	"github.com/shirou/gopsutil/host"
)

func GetRelease() (string, error) {
	info, err := host.Info()
	if err != nil {
		return "", err
	}

	release := info.PlatformVersion
	return release, nil
}
