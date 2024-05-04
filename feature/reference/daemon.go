package reference

import (
	"os"
	"os/signal"
	"sync"
	"syscall"

	"github.com/bclswl0827/openstation/driver/reference"
	"github.com/bclswl0827/openstation/driver/serial"
	"github.com/bclswl0827/openstation/feature"
)

func (d *Reference) Run(options *feature.Options, waitGroup *sync.WaitGroup) {
	var (
		deviceName = options.Config.Monitor.Device
		baudRate   = options.Config.Monitor.Baud
		driver     = &reference.ReferenceBoardDriverImpl{}
	)

	port, err := serial.Open(deviceName, baudRate)
	if err != nil {
		d.OnError(options, err)
		return
	}

	d.OnMessage(options, "reference service has been started")
	defer serial.Close(port)

	waitGroup.Add(1)
	defer waitGroup.Done()

	var status reference.ReferenceStatus
	err = driver.GetReferenceStatus(port, &status)
	if err != nil {
		d.OnError(options, err)
		return
	}

	// Receive interrupt signals
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, os.Interrupt, syscall.SIGTERM)

	// Wait for interrupt signals
	<-sigCh
	d.OnMessage(options, "closing reference service")
	serial.Close(port)
}
