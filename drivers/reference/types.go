package reference

import (
	"io"
)

type ReferenceState struct {
	IsRTCValid    bool
	IsGNSSValid   bool
	Timestamp     int64
	Latitude      float64
	Longitude     float64
	Declination   float64
	MagAzimuth    float64
	MagneticCount [3]float64
}

type ReferenceDriver interface {
	GetState(port io.ReadWriteCloser, calib [3]float64, state *ReferenceState) error
}
