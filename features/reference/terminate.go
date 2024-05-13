package reference

import (
	"github.com/bclswl0827/openstation/drivers/serial"
	"github.com/bclswl0827/openstation/features"
)

func (d *Reference) Terminate(options *features.Options) {
	serial.Close(d.serialPort)
	d.OnStop(options)
}
