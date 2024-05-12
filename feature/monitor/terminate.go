package monitor

import (
	"github.com/bclswl0827/openstation/driver/serial"
	"github.com/bclswl0827/openstation/feature"
)

func (d *Monitor) Terminate(options *feature.Options) {
	serial.Close(d.serialPort)
	d.OnStop(options)
}
