package gnss

import (
	"time"

	"github.com/bclswl0827/go-serial"
)

type GnssTime struct {
	BaseTime time.Time
	RefTime  time.Time
}

type GnssState struct {
	IsDataValid bool
	DataQuality int
	Satellites  int
	Latitude    float64
	Longitude   float64
	Elevation   float64
	TrueAzimuth float64
	Time        GnssTime
}

type GnssDependency struct {
	Port  *serial.Port
	State *GnssState
}

type GnssDriver interface {
	SetBaseline(deps *GnssDependency, baseline float64) error
	GetBaseline(deps *GnssDependency) (float64, error)
	GetState(deps *GnssDependency) error
}
