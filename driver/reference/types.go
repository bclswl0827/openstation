package reference

import "io"

type ReferenceStatus struct {
	IsRTCValid  bool
	IsGNSSValid bool
	IsTrueNorth bool
	Timestamp   int64
	Latitude    float64
	Longitude   float64
	Altitude    float64
}

type ReferenceDriver interface {
	// Reads current status from the reference board
	GetReferenceStatus(io.ReadWriteCloser, *ReferenceStatus) error
}
