package alignment

import (
	"slices"
	"time"

	"github.com/bclswl0827/openstation/drivers/gnss"
	"github.com/bclswl0827/openstation/drivers/pan_tilt"
	"github.com/bclswl0827/openstation/startups"
	"github.com/bclswl0827/openstation/utils/logger"
	"go.uber.org/dig"
)

func (t *AlignmentStartupTask) Execute(depsContainer *dig.Container, options *startups.Options) error {
	// Return directly if the system is in mock mode
	if options.MockMode {
		logger.GetLogger(t.GetTaskName()).Info("system is in mock mode, skip alignment process")
		return nil
	}
	// Calculate the azimuth offset to true north, then set the Pan-Tilt to the calculated true north
	err := depsContainer.Invoke(func(gnssDeps *gnss.GnssDependency, panTiltDeps *pan_tilt.PanTiltDependency) error {
		panTiltDriver := pan_tilt.PanTiltDriver(&pan_tilt.PanTiltDriverImpl{})

		// Set Pan-Tilt to zero position
		logger.GetLogger(t.GetTaskName()).Infoln("applying zero position to Pan-Tilt device")
		panTiltDeps.NorthOffset = 0
		err := panTiltDriver.SetTilt(panTiltDeps, 0)
		if err != nil {
			return err
		}
		err = panTiltDriver.SetPan(panTiltDeps, 0)
		if err != nil {
			return err
		}

		// Lock Pan-Tilt status
		panTiltDeps.IsBusy = true
		logger.GetLogger(t.GetTaskName()).Info("start calculating Pan-Tilt offset to true north")

		var prevGnssTime gnss.GnssTime
		for {
			var (
				azimuthBuffer  []float64
				isNotAvailable bool
			)
			for i := 0; i <= AZI_COLLECT_COUNT; {
				if prevGnssTime.RefTime.UnixMilli() != gnssDeps.State.Time.RefTime.UnixMilli() {
					prevGnssTime = *gnssDeps.State.Time

					// Wait for RTK Fix / Float result
					if gnssDeps.State.DataQuality == 0 {
						logger.GetLogger(t.GetTaskName()).Warn("GNSS azimuth data is not available, skip")
						continue
					}

					logger.GetLogger(t.GetTaskName()).Infof("collecting azimuth data %.1f%%, current azimuth is %.2f", float64(i)/AZI_COLLECT_COUNT*100, gnssDeps.State.TrueAzimuth)
					azimuthBuffer = append(azimuthBuffer, gnssDeps.State.TrueAzimuth)

					// Check if the results is whtin the error threshold
					if i > 0 && (slices.Max(azimuthBuffer)-slices.Min(azimuthBuffer) > AZI_ERROR_THRESHOLD) {
						logger.GetLogger(t.GetTaskName()).Warnf("azimuth is not within the error threshold %.2f degrees, try again", AZI_ERROR_THRESHOLD)
						isNotAvailable = true
						break
					}

					i++
				}

				time.Sleep(time.Millisecond * 100)
			}

			// Unlock Pan-Tilt status
			if !isNotAvailable {
				panTiltDeps.IsBusy = false
				break
			}
		}

		// Set azimuth as pan-tilt true north offset
		panTiltDeps.NorthOffset = gnssDeps.State.TrueAzimuth
		logger.GetLogger(t.GetTaskName()).Infof("setting Pan-Tilt to true north with offset %.2f", panTiltDeps.NorthOffset)
		return panTiltDriver.SetPan(panTiltDeps, 0)
	})
	if err != nil {
		return err
	}

	logger.GetLogger(t.GetTaskName()).Info("alignment completed and system is ready")
	return nil
}
