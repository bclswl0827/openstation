package pan_tilt

import "io"

type PanTilt interface {
	IsAvailable(port io.ReadWriteCloser) bool
	Init(port io.ReadWriteCloser) error
	Reset(port io.ReadWriteCloser) error
	GetPan(port io.ReadWriteCloser) (float64, error)
	GetTilt(port io.ReadWriteCloser) (float64, error)
	SetPan(port io.ReadWriteCloser, pan, offset float64) error
	SetTilt(port io.ReadWriteCloser, tilt, offset float64) error
}
