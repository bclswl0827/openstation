package pan_tilt

import "io"

const ERROR_THRESHOLD = 0.3 // 0.3 degree error threshold

type PanTiltDependency struct {
	Port        io.ReadWriteCloser
	CurrentPan  float64
	CurrentTilt float64
	NorthOffset float64
}

type PanTiltDriver interface {
	IsAvailable(deps *PanTiltDependency) bool
	Init(deps *PanTiltDependency) error
	Reset(deps *PanTiltDependency, sig chan<- bool) error
	GetPan(deps *PanTiltDependency) error
	GetTilt(deps *PanTiltDependency) error
	SetPan(deps *PanTiltDependency, newPan float64, sig chan<- bool) error
	SetTilt(deps *PanTiltDependency, newTilt float64, sig chan<- bool) error
}
