package monitor

import (
	"fmt"
	"time"

	"github.com/bclswl0827/openstation/drivers/monitor"
	"github.com/bclswl0827/openstation/drivers/pan_tilt"
	"github.com/bclswl0827/openstation/services"
	"github.com/bclswl0827/openstation/utils/logger"
)

func (s *MonitorService) Start(options *services.Options) {
	driver := monitor.MonitorDriver(&monitor.MonitorDriverImpl{})
	for {
		options.Dependency.Invoke(func(monitorDeps *monitor.MonitorDependency, panTiltDeps *pan_tilt.PanTiltDependency) {
			var (
				pan  = panTiltDeps.CurrentPan
				tilt = panTiltDeps.CurrentTilt
			)
			driver.Display(monitorDeps, fmt.Sprintf("Pan: %.2f deg\nTilt: %.2f deg", pan, tilt), 0, 0)
		})

		time.Sleep(time.Second)
	}
}

func (s *MonitorService) OnStart() {
	logger.GetLogger(s.GetTaskName()).Infoln("monitor service has been started")
}
