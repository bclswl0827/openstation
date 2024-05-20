package gnss

import (
	"io"
	"time"
)

type GnssTime struct {
	BaseTime time.Time
	RefTime  time.Time
}

type GnssState struct {
	IsDataValid bool
	DataQuality int
	Latitude    float64
	Longitude   float64
	TrueAzimuth float64
	Time        GnssTime
}

type GnssDependency struct {
	Port  io.ReadWriteCloser
	State *GnssState
}

type GnssDriver interface {
	IsAvailable(deps *GnssDependency) bool
	SetBaseline(deps *GnssDependency, baseline float64) error
	GetState(deps *GnssDependency) error
}
