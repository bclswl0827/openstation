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
		driver     = &monitor.LCD1602DriverImpl{}
	)

	port, err := serial.Open(deviceName, baudRate)
	if err != nil {
		d.OnError(options, err)
		return
	}

	d.OnMessage(options, "display service has been started")
	defer serial.Close(port)

	waitGroup.Add(1)
	defer waitGroup.Done()

	d.OnMessage(options, "initializing display")
	err = driver.Init(port)
	if err != nil {
		d.OnError(options, err)
		return
	}

	d.OnMessage(options, "display initialized")
	go d.displayStatus(driver, port)

	// Receive interrupt signals
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, os.Interrupt, syscall.SIGTERM)

	// Wait for interrupt signals
	<-sigCh
	d.OnMessage(options, "closing display service")
	serial.Close(port)
}
