package gnss

import (
	"time"

	"github.com/bclswl0827/openstation/drivers/transport"
)

type GnssTime struct {
	LocalBaseTime time.Time
	ReferenceTime time.Time
}

type GnssState struct {
	IsDataValid bool
	DataQuality int
	Satellites  int
	Latitude    float64
	Longitude   float64
	Elevation   float64
	TrueAzimuth float64
	Time        *GnssTime
}

type GnssDependency struct {
	Transport transport.TransportDriver
	State     *GnssState
}

type GnssDriver interface {
	readerDaemon(deps *GnssDependency)
	IsAvailable(deps *GnssDependency) bool
	Init(deps *GnssDependency) error
	SetBaseline(deps *GnssDependency, baseline float64) error
	GetBaseline(deps *GnssDependency) (float64, error)
}
