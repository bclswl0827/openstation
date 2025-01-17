package peripherals

import (
	"github.com/bclswl0827/openstation/cleaners"
	"github.com/bclswl0827/openstation/drivers/gnss"
	"github.com/bclswl0827/openstation/drivers/pan_tilt"
	"github.com/bclswl0827/openstation/utils/logger"
)

func (p *PeripheralsCleanerTask) Execute(options *cleaners.Options) {
	if !options.MockMode {
		options.Dependency.Invoke(func(panTiltDeps *pan_tilt.PanTiltDependency, gnssDeps *gnss.GnssDependency) {
			// Close serial ports
			logger.GetLogger(p.GetTaskName()).Info("closing connection to Pan-Tilt")
			panTiltDeps.Transport.Close()
			logger.GetLogger(p.GetTaskName()).Info("closing connection to GNSS receiver")
			gnssDeps.Transport.Close()
		})
	}
}
