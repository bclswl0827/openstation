package monitor

import (
	"fmt"

	"github.com/bclswl0827/openstation/drivers/monitor"
	"github.com/bclswl0827/openstation/drivers/pan_tilt"
	"github.com/bclswl0827/openstation/services"
	"github.com/bclswl0827/openstation/utils/logger"
)

func (s *MonitorService) Start(options *services.Options) {
	driver := monitor.MonitorDriver(&monitor.MonitorDriverImpl{})
	var (
		monitorDeps *monitor.MonitorDependency
		panTiltDeps *pan_tilt.PanTiltDependency
	)
	options.Dependency.Invoke(func(md *monitor.MonitorDependency, pd *pan_tilt.PanTiltDependency) {
		monitorDeps = md
		panTiltDeps = pd
		md.ForceMode = false
	})
	for {
		err := driver.Display(monitorDeps, fmt.Sprintf("Pan: %.2f deg\nTilt: %.2f deg", panTiltDeps.CurrentPan, panTiltDeps.CurrentTilt), 0, 0)
		if err != nil {
			break
		}
	}
}

func (s *MonitorService) OnStart() {
	logger.GetLogger(s.GetTaskName()).Infoln("monitor service has been started")
}
