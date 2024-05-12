package pan_tilt

import "io"

const ERROR_THRESHOLD = 0.3 // 0.3 degree error threshold

type PanTilt interface {
	IsAvailable(port io.ReadWriteCloser) bool
	Init(port io.ReadWriteCloser) error
	Reset(port io.ReadWriteCloser, sig chan bool) error
	GetPan(port io.ReadWriteCloser) (float64, error)
	GetTilt(port io.ReadWriteCloser) (float64, error)
	SetPan(port io.ReadWriteCloser, pan, offset float64, sig chan bool) error
	SetTilt(port io.ReadWriteCloser, tilt, offset float64, sig chan bool) error
}
