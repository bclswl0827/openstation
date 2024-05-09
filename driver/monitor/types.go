package monitor

import "io"

type MonitorState struct {
	Busy  bool
	Error bool
}

type MonitorDriver interface {
	Display(port io.ReadWriteCloser, state MonitorState, text string, x int, y int) error
	Clear(port io.ReadWriteCloser) error
	Reset(port io.ReadWriteCloser) error
	Init(port io.ReadWriteCloser) error
}
