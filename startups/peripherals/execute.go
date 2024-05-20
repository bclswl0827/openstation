package peripherals

import (
	"time"

	"github.com/bclswl0827/openstation/drivers/gnss"
	"github.com/bclswl0827/openstation/drivers/monitor"
	"github.com/bclswl0827/openstation/drivers/pan_tilt"
	"github.com/bclswl0827/openstation/startups"
	"github.com/bclswl0827/openstation/utils/logger"
	"go.uber.org/dig"
)

func (t *PeripheralsStartupTask) Execute(depsContainer *dig.Container, options *startups.Options) error {
	var (
		monitorDriver = monitor.MonitorDriver(&monitor.MonitorDriverImpl{})
		panTiltDriver = pan_tilt.PanTiltDriver(&pan_tilt.PanTiltDriverImpl{})
		gnssDriver    = gnss.GnssDriver(&gnss.GnssDriverImpl{})
	)

	// Reset and initialize display screen
	err := depsContainer.Invoke(func(deps *monitor.MonitorDependency) error {
		err := monitorDriver.Reset(deps)
		if err != nil {
			return err
		}
		err = monitorDriver.Init(deps)
		if err != nil {
			return err
		}

		// Display initializing screen
		deps.State.Busy = true
		deps.State.Error = true
		return monitorDriver.Display(deps, "SYS INIT...", 0, 0)
	})
	if err != nil {
		return err
	}

	// Reset PanTilt device, set both pan and tilt to 0
	err = depsContainer.Invoke(func(deps *pan_tilt.PanTiltDependency) error {
		for !panTiltDriver.IsAvailable(deps) {
			logger.GetLogger(t.GetTaskName()).Infoln("waiting for Pan-Tilt to be available")
			time.Sleep(time.Second)
		}

		done := make(chan bool, 1)
		err := panTiltDriver.Reset(deps, done)
		if err != nil {
			return err
		}
		<-done

		return panTiltDriver.Init(deps)
	})
	if err != nil {
		return err
	}

	// Check if GNSS is available, wait for position and azimuth
	err = depsContainer.Invoke(func(deps *gnss.GnssDependency) error {
		for !gnssDriver.IsAvailable(deps) {
			logger.GetLogger(t.GetTaskName()).Infoln("waiting for GNSS to be available")
			time.Sleep(time.Second)
		}

		return gnssDriver.SetBaseline(deps, options.Config.GNSS.Baseline)
	})
	if err != nil {
		return err
	}

	return nil
}