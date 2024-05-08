package reference

import "io"

type ReferenceState struct {
	IsRTCValid  bool
	IsGNSSValid bool
	Timestamp   int64
	Latitude    float64
	Longitude   float64
	Altitude    float64
	YawAngle    float64
}

type ReferenceDriver interface {
	GetState(port io.ReadWriteCloser, state *ReferenceState) error
}
