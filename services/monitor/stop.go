package monitor

import (
	"github.com/bclswl0827/openstation/drivers/monitor"
	"github.com/bclswl0827/openstation/services"
	"github.com/bclswl0827/openstation/utils/logger"
)

func (s *MonitorService) Stop(options *services.Options) {
	options.Dependency.Invoke(func(deps *monitor.MonitorDependency) {
		// Display farewell message
		driver := monitor.MonitorDriver(&monitor.MonitorDriverImpl{})
		deps.State.Busy = false
		deps.State.Error = false
		driver.Display(deps, "System Shutdown", 0, 0)
	})
}

func (s *MonitorService) OnStop() {
	logger.GetLogger(s.GetTaskName()).Infoln("monitor service has been stopped")
}
