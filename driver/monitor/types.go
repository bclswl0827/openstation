package monitor

import "io"

type Status struct {
	Busy  bool
	Error bool
}

type MonitorDriver interface {
	// Prints the given string at the given position
	Display(io.ReadWriteCloser, Status, string, int, int) error
	// Clears the monitor display
	Clear(io.ReadWriteCloser) error
	// Resets the monitor display
	Reset(io.ReadWriteCloser) error
	// Initializes the monitor device
	Init(io.ReadWriteCloser) error
}
