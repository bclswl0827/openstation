package peripherals

import (
	"github.com/bclswl0827/openstation/drivers/gnss"
	"github.com/bclswl0827/openstation/drivers/pan_tilt"
	"github.com/bclswl0827/openstation/drivers/serial"
	"github.com/bclswl0827/openstation/startups"
	"go.uber.org/dig"
)

func (t *PeripheralsStartupTask) Provide(container *dig.Container, options *startups.Options) error {
	// Pan-Tilt device
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

	// GNSS device
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
