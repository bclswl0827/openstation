package monitor

import (
	"sync"

	"github.com/bclswl0827/openstation/driver/serial"
	"github.com/bclswl0827/openstation/feature"
)

func (d *Monitor) Terminate(options *feature.Options, waitGroup *sync.WaitGroup) {
	defer serial.Close(d.serialPort)
	defer waitGroup.Done()
	d.OnStop(options)
}
