package monitor

import (
	"fmt"
	"strings"
	"time"

	"github.com/bclswl0827/openstation/driver/monitor"
	"github.com/bclswl0827/openstation/driver/serial"
	"github.com/bclswl0827/openstation/feature"
	"github.com/bclswl0827/openstation/utils/duration"
	"github.com/bclswl0827/openstation/utils/system"
)

func (d *Monitor) Start(options *feature.Options) {
	var (
		deviceName = options.Config.Monitor.Device
		baudRate   = options.Config.Monitor.Baud
		driver     = monitor.MonitorDriver(&monitor.MonitorDriverImpl{})
	)

	port, err := serial.Open(deviceName, baudRate)
	if err != nil {
		d.OnError(options, err, true)
		return
	}
	d.serialPort = port
	d.OnStart(options)

	// Reset display screen
	d.OnEvent(options, "display is being reset")
	err = driver.Reset(port)
	if err != nil {
		d.OnError(options, err, true)
		return
	}
	d.OnEvent(options, "display has been reset")

	// Initialize display screen
	d.OnEvent(options, "display is being initialized")
	err = driver.Init(port)
	if err != nil {
		d.OnError(options, err, true)
		return
	}
	d.OnEvent(options, "display has been initialized")

	// Subscribe to monitor topic
	options.MessageBus.Subscribe(TOPIC_NAME, func(displayText string, state *monitor.MonitorState) {
		options.State.Monitor.IsBusy = true
		err = driver.Display(port, state, displayText, 0, 1)
		if err != nil {
			d.OnError(options, err, false)
			return
		}

		options.State.Monitor.IsBusy = false
		d.OnEvent(options, fmt.Sprintf("current display [%s]", strings.ReplaceAll(displayText, "\n", " ")))
	})
	options.State.Monitor.IsReady = true

	// Show current IP address and RTC time
	for {
		if !options.State.Monitor.IsBusy {
			currentIP, err := system.GetIPv4Addrs()
			if err != nil {
				d.OnError(options, err, true)
				return
			}
			err = driver.Display(port, nil, currentIP[0], 0, 0)
			if err != nil {
				d.OnError(options, err, true)
				return
			}

			time.Sleep(DISPLAY_INTERVAL)

			currentTime, _ := duration.GetOffsetTime(options.State.RTCTime.TimeOffset)
			err = driver.Display(port, nil, currentTime.Format("06-01-02 15:04"), 0, 0)
			if err != nil {
				d.OnError(options, err, true)
				return
			}
		}

		time.Sleep(DISPLAY_INTERVAL)
	}
}
