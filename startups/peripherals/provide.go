package peripherals

import (
	"time"

	"github.com/bclswl0827/openstation/drivers/gnss"
	"github.com/bclswl0827/openstation/drivers/pan_tilt"
	"github.com/bclswl0827/openstation/drivers/serial"
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
					RefTime:  time.Now().UTC().Add(time.Second),
					BaseTime: time.Now().UTC(),
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
	var (
		panTiltDeviceName = options.Config.PanTilt.Device
		panTiltBaudRate   = options.Config.PanTilt.BaudRate
	)
	panTiltPort, err := serial.Open(panTiltDeviceName, panTiltBaudRate)
	if err != nil {
		return err
	}

	err = container.Provide(func() *pan_tilt.PanTiltDependency {
		return &pan_tilt.PanTiltDependency{Port: panTiltPort}
	})
	if err != nil {
		return err
	}

	// Open GNSS device
	var (
		gnssDeviceName = options.Config.GNSS.Device
		gnssBaudRate   = options.Config.GNSS.BaudRate
	)
	gnssPort, err := serial.Open(gnssDeviceName, gnssBaudRate)
	if err != nil {
		return err
	}

	err = container.Provide(func() *gnss.GnssDependency {
		return &gnss.GnssDependency{
			Port:  gnssPort,
			State: &gnss.GnssState{},
		}
	})
	if err != nil {
		return err
	}

	return nil
}
