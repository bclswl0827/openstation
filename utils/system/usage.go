package system

import (
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
	partitions, err := disk.Partitions(true)
	if err != nil {
		return -1, err
	}

	var totalUsage float64
	for _, partition := range partitions {
		usage, err := disk.Usage(partition.Mountpoint)
		if err != nil {
			return -1, err
		}
		totalUsage += usage.UsedPercent
	}

	avgDiskUsage := totalUsage / float64(len(partitions))
	return avgDiskUsage, nil
}
