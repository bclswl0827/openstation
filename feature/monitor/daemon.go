package monitor

import (
	"os"
	"os/signal"
	"sync"
	"syscall"

	"github.com/bclswl0827/openstation/driver/monitor"
	"github.com/bclswl0827/openstation/driver/serial"
	"github.com/bclswl0827/openstation/feature"
)

func (d *Monitor) Run(options *feature.Options, waitGroup *sync.WaitGroup) {
	var (
		deviceName = options.Config.Monitor.Device
		baudRate   = options.Config.Monitor.Baud
		driver     = &monitor.MonitorDriverImpl{}
	)

	port, err := serial.Open(deviceName, baudRate)
	if err != nil {
		d.OnError(options, err, true)
		return
	}
	d.OnStart(options)
	defer serial.Close(port)

	waitGroup.Add(1)
	defer waitGroup.Done()

	// Initialize display screen
	err = driver.Init(port)
	if err != nil {
		d.OnError(options, err, false)
		return
	}
	d.OnEvent(options, "display has been initialized")

	// Clear display screen
	err = driver.Clear(port)
	if err != nil {
		d.OnError(options, err, false)
		return
	}
	d.OnEvent(options, "display screen has been cleared")
	options.States.IsMonitorReady = true

	// Subscribe to monitor topic
	options.MessageBus.Subscribe(TOPIC_NAME, func(displayText string, state monitor.MonitorState, clear bool) {
		if clear {
			err := driver.Clear(port)
			if err != nil {
				d.OnError(options, err, false)
			}
			return
		}
		err := driver.Display(port, state, displayText, 0, 0)
		if err != nil {
			d.OnError(options, err, false)
		}
	})

	// Receive interrupt signals
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, os.Interrupt, syscall.SIGTERM)

	// Wait for interrupt signals
	<-sigCh
	d.OnStop(options)
}
