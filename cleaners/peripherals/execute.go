package peripherals

import (
	"github.com/bclswl0827/openstation/cleaners"
	"github.com/bclswl0827/openstation/drivers/gnss"
	"github.com/bclswl0827/openstation/drivers/monitor"
	"github.com/bclswl0827/openstation/drivers/pan_tilt"
	"github.com/bclswl0827/openstation/drivers/serial"
)

func (p *PeripheralsCleanerTask) Execute(options *cleaners.Options) {
	options.Dependency.Invoke(func(monitorDeps *monitor.MonitorDependency, panTiltDeps *pan_tilt.PanTiltDependency, gnssDeps *gnss.GnssDependency) {
		serial.Close(monitorDeps.Port)
		serial.Close(panTiltDeps.Port)
		serial.Close(gnssDeps.Port)
	})
}
