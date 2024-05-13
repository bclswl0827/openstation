package monitor

import (
	"github.com/bclswl0827/openstation/drivers/serial"
	"github.com/bclswl0827/openstation/features"
)

func (d *Monitor) Terminate(options *features.Options) {
	serial.Close(d.serialPort)
	d.OnStop(options)
}
