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
	var (
		panTiltDriver = pan_tilt.PanTiltDriver(&pan_tilt.PanTiltDriverImpl{})
		gnssDriver    = gnss.GnssDriver(&gnss.GnssDriverImpl{})
	)

	// Initialize GNSS device
	err := depsContainer.Invoke(func(deps *gnss.GnssDependency) error {
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

	// Setup PanTilt device, set both pan and tilt to zero position
	err = depsContainer.Invoke(func(deps *pan_tilt.PanTiltDependency) error {
		logger.GetLogger(t.GetTaskName()).Infoln("initializing Pan-Tilt device")
		for !panTiltDriver.IsAvailable(deps) {
			logger.GetLogger(t.GetTaskName()).Infoln("waiting for Pan-Tilt to be available")
			time.Sleep(time.Second)
		}

		// logger.GetLogger(t.GetTaskName()).Infoln("resetting Pan-Tilt device, this may take a while")
		// sig := make(chan bool)
		// err := panTiltDriver.Reset(deps, sig)
		// if err != nil {
		// 	return err
		// }
		// <-sig
		// logger.GetLogger(t.GetTaskName()).Infoln("Pan-Tilt device reset action has completed")

		logger.GetLogger(t.GetTaskName()).Infoln("applying zero position to Pan-Tilt device")
		return panTiltDriver.Init(deps, true)
	})
	if err != nil {
		return err
	}

	return nil
}
