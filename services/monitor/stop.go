package monitor

import (
	"github.com/bclswl0827/openstation/drivers/monitor"
	"github.com/bclswl0827/openstation/services"
	"github.com/bclswl0827/openstation/utils/logger"
)

func (s *MonitorService) Stop(options *services.Options) {
	driver := monitor.MonitorDriver(&monitor.MonitorDriverImpl{})
	var tempMonitorDeps monitor.MonitorDependency

	options.Dependency.Invoke(func(monitorDeps *monitor.MonitorDependency) {
		monitorDeps.ForceMode = true
		tempMonitorDeps = *monitorDeps
		monitorDeps.Port = nil

		// Display farewell message
		tempMonitorDeps.State.Busy = false
		tempMonitorDeps.State.Error = false
		driver.Clear(&tempMonitorDeps)
		driver.Display(&tempMonitorDeps, "System Shutdown\n", 0, 0)

		monitorDeps.Port = tempMonitorDeps.Port
	})
}

func (s *MonitorService) OnStop() {
	logger.GetLogger(s.GetTaskName()).Infoln("monitor service has been stopped")
}
