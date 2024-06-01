package alignment

import (
	"github.com/bclswl0827/openstation/drivers/gnss"
	"github.com/bclswl0827/openstation/drivers/monitor"
	"github.com/bclswl0827/openstation/drivers/pan_tilt"
	"github.com/bclswl0827/openstation/startups"
	"github.com/bclswl0827/openstation/utils/array"
	"github.com/bclswl0827/openstation/utils/logger"
	"go.uber.org/dig"
)

func (t *AlignmentStartupTask) Execute(depsContainer *dig.Container, options *startups.Options) error {
	var (
		monitorDriver = monitor.MonitorDriver(&monitor.MonitorDriverImpl{})
		panTiltDriver = pan_tilt.PanTiltDriver(&pan_tilt.PanTiltDriverImpl{})
		gnssDriver    = gnss.GnssDriver(&gnss.GnssDriverImpl{})
	)

	// Change display screen to alignment screen
	err := depsContainer.Invoke(func(deps *monitor.MonitorDependency) error {
		deps.State.Busy = true
		deps.State.Error = false
		return monitorDriver.Display(deps, "Finding North...", 0, 0)
	})
	if err != nil {
		return err
	}

	// Calculate the azimuth offset to true north
	err = depsContainer.Invoke(func(gnssDeps *gnss.GnssDependency, panTiltDeps *pan_tilt.PanTiltDependency) error {
		logger.GetLogger(t.GetTaskName()).Info("start calculating Pan-Tilt offset to true north")

		// Use RTK fix & RTK float data quality
		for gnssDeps.State.DataQuality != 4 && gnssDeps.State.DataQuality != 6 {
			logger.GetLogger(t.GetTaskName()).Info("waiting for GNSS to calculate azimuth")
			err := gnssDriver.GetState(gnssDeps)
			if err != nil {
				return err
			}
		}

		for {
			var azimuthBuffer []float64
			for i := 0; i <= AZI_COLLECT_COUNT; i++ {
				err := gnssDriver.GetState(gnssDeps)
				if err != nil {
					return err
				}

				logger.GetLogger(t.GetTaskName()).Infof("collecting azimuth data %.2f%%, current azimuth is %.2f", float64(i)/AZI_COLLECT_COUNT*100, gnssDeps.State.TrueAzimuth)
				azimuthBuffer = append(azimuthBuffer, gnssDeps.State.TrueAzimuth)
			}

			// Check if the azimuth is within the error threshold
			maxAzimuth, _ := array.Max(azimuthBuffer)
			minAzimuth, _ := array.Min(azimuthBuffer)
			if maxAzimuth-minAzimuth <= AZI_ERROR_THRESHOLD {
				break
			}

			logger.GetLogger(t.GetTaskName()).Errorln("azimuth is not stable, try again")
		}

		// Set azimuth as pan-tilt true north offset
		panTiltDeps.NorthOffset = 360 - gnssDeps.State.TrueAzimuth
		return nil
	})
	if err != nil {
		return err
	}

	// Set Pan-Tilt to the calculated true north
	err = depsContainer.Invoke(func(deps *pan_tilt.PanTiltDependency) error {
		logger.GetLogger(t.GetTaskName()).Infof("setting Pan-Tilt to true north with offset %.2f", deps.NorthOffset)

		done := make(chan bool, 1)
		err := panTiltDriver.SetPan(deps, 0, done)
		if err != nil {
			return err
		}
		<-done

		return nil
	})
	if err != nil {
		return err
	}

	// Change display screen to ready screen
	err = depsContainer.Invoke(func(deps *monitor.MonitorDependency) error {
		deps.State.Busy = false
		deps.State.Error = false
		return monitorDriver.Display(deps, "System Ready :-)", 0, 0)
	})
	if err != nil {
		return err
	}

	logger.GetLogger(t.GetTaskName()).Info("alignment completed and system is ready")
	return nil
}
