package pan_tilt

import "github.com/bclswl0827/go-serial"

const ERROR_THRESHOLD = 0.2 // 0.2 degree error threshold

const (
	MAX_PAN  = 359.99
	MIN_PAN  = 0.0
	MAX_TILT = 90
	MIN_TILT = 5
)

type PanTiltDependency struct {
	Port        *serial.Port
	CurrentPan  float64
	CurrentTilt float64
	NorthOffset float64
	IsBusy      bool
}

type PanTiltDriver interface {
	IsAvailable(deps *PanTiltDependency) bool
	Init(deps *PanTiltDependency) error
	Reset(deps *PanTiltDependency, sig chan<- bool) error
	GetPanTilt(deps *PanTiltDependency, daemon bool) error
	SetPan(deps *PanTiltDependency, newPan float64, sig chan<- bool) error
	SetTilt(deps *PanTiltDependency, newTilt float64, sig chan<- bool) error
}
