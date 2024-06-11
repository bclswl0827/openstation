package monitor

import "github.com/bclswl0827/go-serial"

type MonitorState struct {
	Busy  bool
	Error bool
}

type MonitorDependency struct {
	ForceMode bool
	Port      *serial.Port
	State     *MonitorState
}

type MonitorDriver interface {
	Display(deps *MonitorDependency, text string, x int, y int) error
	Clear(deps *MonitorDependency) error
	Reset(deps *MonitorDependency) error
	Init(deps *MonitorDependency) error
}
