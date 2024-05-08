package system

import "github.com/shirou/gopsutil/host"

func GetArch() (string, error) {
	info, err := host.Info()
	if err != nil {
		return "", err
	}

	return info.KernelArch, nil
}
