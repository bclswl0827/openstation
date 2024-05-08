package monitor

import "io"

type MonitorState struct {
	Busy  bool
	Error bool
}

type MonitorDriver interface {
	// Prints the given string at the given position
	Display(port io.ReadWriteCloser, state MonitorState, text string, x int, y int) error
	// Clears the monitor display
	Clear(port io.ReadWriteCloser) error
	// Resets the monitor display
	Reset(port io.ReadWriteCloser) error
	// Initializes the monitor device
	Init(port io.ReadWriteCloser) error
}
