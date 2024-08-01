package peripherals

import (
	"time"

	"github.com/bclswl0827/openstation/drivers/gnss"
	"github.com/bclswl0827/openstation/drivers/pan_tilt"
	"github.com/bclswl0827/openstation/drivers/transport"
	"github.com/bclswl0827/openstation/startups"
	"go.uber.org/dig"
)

func (t *PeripheralsStartupTask) mockProvide(container *dig.Container, _ *startups.Options) error {
	container.Provide(func() *pan_tilt.PanTiltDependency {
		return &pan_tilt.PanTiltDependency{
			CurrentPan:  160,
			CurrentTilt: 45,
			NorthOffset: 60,
		}
	})

	container.Provide(func() *gnss.GnssDependency {
		return &gnss.GnssDependency{
			State: &gnss.GnssState{
				IsDataValid: true,
				Latitude:    40,
				Longitude:   116,
				Elevation:   10,
				Satellites:  40,
				TrueAzimuth: 128,
				DataQuality: 4,
				Time: &gnss.GnssTime{
					ReferenceTime: time.Now().UTC().Add(time.Second),
					LocalBaseTime: time.Now().UTC(),
				},
			},
		}
	})

	return nil
}

func (t *PeripheralsStartupTask) Provide(container *dig.Container, options *startups.Options) error {
	// Call the mockProvide function if the MockMode is true
	if options.MockMode {
		return t.mockProvide(container, options)
	}

	// Open Pan-Tilt device
	panTiltDsn := &transport.TransportDependency{
		DSN:    options.Config.PanTilt.DSN,
		Engine: options.Config.PanTilt.Engine,
	}
	panTiltTransport, err := transport.New(panTiltDsn)
	if err != nil {
		return err
	}
	err = panTiltTransport.Open(panTiltDsn)
	if err != nil {
		return err
	}
	err = container.Provide(func() *pan_tilt.PanTiltDependency {
		return &pan_tilt.PanTiltDependency{
			Transport:   panTiltTransport,
			CancelToken: t.CancelToken,
		}
	})
	if err != nil {
		return err
	}

	// Open GNSS device
	gnssDsn := &transport.TransportDependency{
		DSN:    options.Config.GNSS.DSN,
		Engine: options.Config.GNSS.Engine,
	}
	gnssTransport, err := transport.New(gnssDsn)
	if err != nil {
		return err
	}
	err = gnssTransport.Open(gnssDsn)
	if err != nil {
		return err
	}
	err = container.Provide(func() *gnss.GnssDependency {
		return &gnss.GnssDependency{
			Transport:   gnssTransport,
			CancelToken: t.CancelToken,
			State:       &gnss.GnssState{},
		}
	})
	if err != nil {
		return err
	}

	return nil
}
