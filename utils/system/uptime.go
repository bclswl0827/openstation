package system

import (
	"github.com/shirou/gopsutil/host"
)

func GetUptime() (int64, error) {
	info, err := host.Info()
	if err != nil {
		return -1, err
	}

	return int64(info.Uptime), nil
}
