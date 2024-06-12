package pan_tilt

import "github.com/bclswl0827/go-serial"

const ERROR_THRESHOLD = 0.2 // 0.2 degree error threshold

const (
	MAX_PAN  = 360
	MIN_PAN  = 0
	MAX_TILT = 85
	MIN_TILT = 0
)

type PanTiltDependency struct {
	Port        *serial.Port
	CurrentPan  float64
	CurrentTilt float64
	NorthOffset float64
	IsBusy      bool
}

type PanTiltDriver interface {
	readerDaemon(deps *PanTiltDependency)
	IsAvailable(deps *PanTiltDependency) bool
	Reset(deps *PanTiltDependency, sig chan<- bool) error
	Init(deps *PanTiltDependency, zeroPosition bool) error
	SetPan(deps *PanTiltDependency, newPan float64, wait bool) error
	SetTilt(deps *PanTiltDependency, newTilt float64, wait bool) error
}
