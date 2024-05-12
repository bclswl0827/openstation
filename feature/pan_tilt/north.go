package pan_tilt

import (
	"io"
	"time"

	"github.com/bclswl0827/openstation/driver/pan_tilt"
	"github.com/bclswl0827/openstation/feature"
	"github.com/bclswl0827/openstation/utils/array"
)

func (p *PanTilt) FindNorth(port io.ReadWriteCloser, driver pan_tilt.PanTilt, state *feature.State) (float64, error) {
	const (
		FAST_STEP     = 10
		SLOW_STEP     = 0.2
		ERR_THRESHOLD = 0.1
	)

	// Get the azimuth data for each pan
	azimuthData := []float64{}
	for i := 0; i < 360/FAST_STEP; i++ {
		var (
			sig = make(chan bool)
			pan = float64(i * FAST_STEP)
		)
		err := driver.SetPan(port, pan, 0, sig)
		if err != nil {
			return 0, err
		}
		<-sig

		time.Sleep(500 * time.Millisecond)
		azimuthData = append(azimuthData, state.Compass.Azimuth)
	}

	// Find the azimuth with maximum value and set it as the base azimuth
	aziMeasured, panIndex := array.Max(azimuthData)
	basePan := float64(panIndex * FAST_STEP)

	// Set the pan to the target azimuth
	sig := make(chan bool)
	err := driver.SetPan(port, basePan, 0, sig)
	if err != nil {
		return 0, err
	}
	<-sig

	// Return if the azimuth is within ERROR_THRESHOLD
	if aziMeasured <= ERR_THRESHOLD || aziMeasured >= 360-ERR_THRESHOLD {
		return basePan, nil
	}

	// Rotate the pan to the north with slow step
	for {
		currentPan, err := driver.GetPan(port)
		if err != nil {
			return 0, err
		}

		basePan = currentPan - SLOW_STEP
		if basePan < 0 {
			basePan += 360
		}

		sig := make(chan bool)
		err = driver.SetPan(port, basePan, 0, sig)
		if err != nil {
			return 0, err
		}
		<-sig

		time.Sleep(100 * time.Millisecond)
		currentAzi := state.Compass.Azimuth

		// Check if azimuth is within ERROR_THRESHOLD
		if currentAzi <= ERR_THRESHOLD || currentAzi >= 360-ERR_THRESHOLD {
			break
		}
	}

	return basePan, nil
}
