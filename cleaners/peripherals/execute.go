package peripherals

import (
	"github.com/bclswl0827/openstation/cleaners"
	"github.com/bclswl0827/openstation/drivers/gnss"
	"github.com/bclswl0827/openstation/drivers/monitor"
	"github.com/bclswl0827/openstation/drivers/pan_tilt"
	"github.com/bclswl0827/openstation/drivers/serial"
)

func (p *PeripheralsCleanerTask) Execute(options *cleaners.Options) {
	// Close monitor device
	options.Dependency.Invoke(func(monitor monitor.MonitorDependency) {
		serial.Close(monitor.Port)
	})
	// Close pan-tilt device
	options.Dependency.Invoke(func(panTilt pan_tilt.PanTiltDependency) {
		serial.Close(panTilt.Port)
	})
	// Close GNSS device
	options.Dependency.Invoke(func(gnss gnss.GnssDependency) {
		serial.Close(gnss.Port)
	})
}
