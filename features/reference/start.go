package reference

import (
	"time"

	"github.com/bclswl0827/openstation/drivers/reference"
	"github.com/bclswl0827/openstation/drivers/serial"
	"github.com/bclswl0827/openstation/features"
	"github.com/bclswl0827/openstation/utils/duration"
)

func (d *Reference) Start(options *features.Options) {
	var (
		deviceName = options.Config.Reference.Device
		baudRate   = options.Config.Reference.Baud
		driver     = reference.ReferenceDriver(&reference.ReferenceDriverImpl{})
	)

	port, err := serial.Open(deviceName, baudRate)
	if err != nil {
		d.OnError(options, err, true)
		return
	}
	d.serialPort = port
	d.OnStart(options)

	for {
		var state reference.ReferenceState
		err := driver.GetState(port, options.Config.Reference.Calibration, &state)
		if err != nil {
			d.OnError(options, err, false)
			continue
		}

		var (
			localTime = time.Now().UTC()
			rtcTime   = time.UnixMilli(state.Timestamp).UTC()
		)
		options.State.RTCTime.IsReady = state.Timestamp != 0
		options.State.RTCTime.IsValid = state.IsRTCValid
		options.State.RTCTime.TimeOffset = duration.Diff(localTime, rtcTime)

		options.State.GNSS.IsReady = true
		options.State.GNSS.IsValid = state.IsGNSSValid
		options.State.GNSS.Latitude = state.Latitude
		options.State.GNSS.Longitude = state.Longitude

		options.State.Compass.IsReady = true
		options.State.Compass.MagAzimuth = state.MagAzimuth
		options.State.Compass.Declination = state.Declination
	}
}
