package system

import (
	"github.com/mackerelio/go-osstat/uptime"
)

func GetUptime() (int64, error) {
	up, err := uptime.Get()
	if err != nil {
		return -1, err
	}

	return int64(up.Seconds()), nil
}
