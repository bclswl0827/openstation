package monitor

import (
	"fmt"
	"strings"
	"sync"

	"github.com/bclswl0827/openstation/driver/monitor"
	"github.com/bclswl0827/openstation/driver/serial"
	"github.com/bclswl0827/openstation/feature"
)

func (d *Monitor) Start(options *feature.Options, waitGroup *sync.WaitGroup) {
	var (
		deviceName = options.Config.Monitor.Device
		baudRate   = options.Config.Monitor.Baud
		driver     = monitor.MonitorDriver(&monitor.MonitorDriverImpl{})
	)

	port, err := serial.Open(deviceName, baudRate)
	if err != nil {
		d.OnError(options, err, true)
	}
	d.serialPort = port
	waitGroup.Add(1)
	d.OnStart(options)

	// Reset display screen
	d.OnEvent(options, "display is being reset")
	err = driver.Reset(port)
	if err != nil {
		d.OnError(options, err, false)
		return
	}
	d.OnEvent(options, "display has been reset")

	// Initialize display screen
	d.OnEvent(options, "display is being initialized")
	err = driver.Init(port)
	if err != nil {
		d.OnError(options, err, false)
		return
	}
	d.OnEvent(options, "display has been initialized")

	// Subscribe to monitor topic
	options.MessageBus.Subscribe(TOPIC_NAME, func(displayText string, state monitor.MonitorState) {
		err := driver.Clear(port)
		if err != nil {
			d.OnError(options, err, false)
		}

		err = driver.Display(port, state, displayText, 0, 0)
		if err != nil {
			d.OnError(options, err, false)
			return
		}

		d.OnEvent(options, fmt.Sprintf("current display [%s]", strings.ReplaceAll(displayText, "\n", " ")))
	})

	options.State.Monitor.IsReady = true
}
