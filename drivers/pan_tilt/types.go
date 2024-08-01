package pan_tilt

import (
	"context"

	"github.com/bclswl0827/openstation/drivers/transport"
)

const ERROR_THRESHOLD = 0.2 // 0.2 degree error threshold

const (
	MAX_PAN  = 360
	MIN_PAN  = 0
	MAX_TILT = 85
	MIN_TILT = 0
)

type PanTiltDependency struct {
	Transport   transport.TransportDriver
	CancelToken context.Context
	CurrentPan  float64
	CurrentTilt float64
	NorthOffset float64
	IsBusy      bool
}

type PanTiltDriver interface {
	readerDaemon(deps *PanTiltDependency)
	IsAvailable(deps *PanTiltDependency) bool
	Reset(deps *PanTiltDependency, sig chan<- bool) error
	Init(deps *PanTiltDependency) error
	SetPan(deps *PanTiltDependency, newPan float64) error
	SetTilt(deps *PanTiltDependency, newTilt float64) error
}
