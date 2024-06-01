package system

import (
	"os"

	"github.com/shirou/gopsutil/cpu"
	"github.com/shirou/gopsutil/disk"
	"github.com/shirou/gopsutil/mem"
)

func GetCPUUsage() (float64, error) {
	percent, err := cpu.Percent(0, false)
	if err != nil {
		return -1, err
	}

	cpuUsage := percent[0]
	return cpuUsage, nil
}

func GetMemUsage() (float64, error) {
	vm, err := mem.VirtualMemory()
	if err != nil {
		return -1, err
	}

	memUsage := vm.UsedPercent
	return memUsage, nil
}

func GetDiskUsage() (float64, error) {
	cwd, err := os.Getwd()
	if err != nil {
		return -1, err
	}

	usage, err := disk.Usage(cwd)
	if err != nil {
		return -1, err
	}

	return usage.UsedPercent, nil
}
