package peripherals

import (
	"github.com/bclswl0827/openstation/cleaners"
	"github.com/bclswl0827/openstation/drivers/gnss"
	"github.com/bclswl0827/openstation/drivers/monitor"
	"github.com/bclswl0827/openstation/drivers/pan_tilt"
	"github.com/bclswl0827/openstation/drivers/serial"
	"github.com/bclswl0827/openstation/utils/logger"
)

func (p *PeripheralsCleanerTask) Execute(options *cleaners.Options) {
	options.Dependency.Invoke(func(monitorDeps *monitor.MonitorDependency, panTiltDeps *pan_tilt.PanTiltDependency, gnssDeps *gnss.GnssDependency) {
		// Close serial ports
		logger.GetLogger(p.GetTaskName()).Info("closing monitor serial port")
		serial.Close(monitorDeps.Port)
		logger.GetLogger(p.GetTaskName()).Info("closing Pan-Tilt serial port")
		serial.Close(panTiltDeps.Port)
		logger.GetLogger(p.GetTaskName()).Info("closing GNSS serial port")
		serial.Close(gnssDeps.Port)
	})
}
