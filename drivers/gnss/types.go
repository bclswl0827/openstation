package gnss

import (
	"io"
)

type GnssState struct {
	IsPositionValid  bool
	IsTimestampValid bool
	Timestamp        int64
	Latitude         float64
	Longitude        float64
	TrueAzimuth      float64
}

type GnssDependency struct {
	Port  io.ReadWriteCloser
	State *GnssState
}

type GnssDriver interface {
	GetState(deps *GnssDependency) error
}
