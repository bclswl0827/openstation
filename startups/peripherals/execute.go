package peripherals

import (
	"time"

	"github.com/bclswl0827/openstation/drivers/gnss"
	"github.com/bclswl0827/openstation/drivers/pan_tilt"
	"github.com/bclswl0827/openstation/startups"
	"github.com/bclswl0827/openstation/utils/logger"
	"go.uber.org/dig"
)

func (t *PeripheralsStartupTask) Execute(depsContainer *dig.Container, options *startups.Options) error {
	// Return directly if the system is in mock mode
	if options.MockMode {
		logger.GetLogger(t.GetTaskName()).Info("system is in mock mode, skip initializing peripherals")
		return nil
	}

	// Initialize GNSS device
	err := depsContainer.Invoke(func(deps *gnss.GnssDependency) error {
		var gnssDriver = gnss.GnssDriver(&gnss.GnssDriverImpl{})

		logger.GetLogger(t.GetTaskName()).Infoln("start checking GNSS availability")
		for !gnssDriver.IsAvailable(deps) {
			logger.GetLogger(t.GetTaskName()).Infoln("waiting for GNSS to be available")
			time.Sleep(time.Second)
		}

		// Setting baseline, retry until success
		for {
			logger.GetLogger(t.GetTaskName()).Infoln("getting current baseline from GNSS device")
			currentBaseline, err := gnssDriver.GetBaseline(deps)
			if err != nil {
				logger.GetLogger(t.GetTaskName()).Warnln("failed to get current baseline from GNSS device, retrying")
				time.Sleep(time.Millisecond * 100)
				continue
			}

			if currentBaseline != options.Config.GNSS.Baseline {
				logger.GetLogger(t.GetTaskName()).Infoln("applying new baseline to GNSS device")
				err := gnssDriver.SetBaseline(deps, options.Config.GNSS.Baseline)
				if err != nil {
					logger.GetLogger(t.GetTaskName()).Warnln("failed to set new baseline to GNSS device, retrying")
					time.Sleep(time.Millisecond * 100)
					continue
				}
			}

			break
		}

		// Initialize GNSS device
		logger.GetLogger(t.GetTaskName()).Infoln("starting GNSS NMEA message reading deamon")
		err := gnssDriver.Init(deps)
		if err != nil {
			return err
		}

		// Waiting for GNSS position data
		for !deps.State.IsDataValid {
			logger.GetLogger(t.GetTaskName()).Infoln("waiting for GNSS data to be valid")
			time.Sleep(time.Second)
		}

		return nil
	})
	if err != nil {
		return err
	}

	// Check if Pan-Tilt device is available, start reader daemon
	return depsContainer.Invoke(func(deps *pan_tilt.PanTiltDependency) error {
		var panTiltDriver = pan_tilt.PanTiltDriver(&pan_tilt.PanTiltDriverImpl{})

		for !panTiltDriver.IsAvailable(deps) {
			logger.GetLogger(t.GetTaskName()).Infoln("waiting for Pan-Tilt to be available")
			time.Sleep(time.Second)
		}

		logger.GetLogger(t.GetTaskName()).Infoln("starting Pan-Tilt reading deamon")
		err = panTiltDriver.Init(deps)
		if err != nil {
			return err
		}

		return nil
	})
}
