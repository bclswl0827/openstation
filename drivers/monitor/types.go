package monitor

import "io"

type MonitorState struct {
	Busy  bool
	Error bool
}

type MonitorDependency struct {
	Port  io.ReadWriteCloser
	State *MonitorState
}

type MonitorDriver interface {
	Display(deps *MonitorDependency, text string, x int, y int) error
	Clear(deps *MonitorDependency) error
	Reset(deps *MonitorDependency) error
	Init(deps *MonitorDependency) error
}
