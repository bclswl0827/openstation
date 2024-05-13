package main

import (
	"flag"

	"github.com/bclswl0827/openstation/drivers/reference"
	"github.com/bclswl0827/openstation/drivers/serial"
	"github.com/davecgh/go-spew/spew"
	"github.com/sirupsen/logrus"
)

func parseCommandLine(args *arguments) {
	flag.StringVar(&args.referenceDevice, "reference-device", "/dev/ttyUSB0", "Path to reference device")
	flag.IntVar(&args.referenceBaudrate, "reference-baudurate", 9600, "Baudrate for reference device")
	flag.Float64Var(&args.offsetX, "offset-x", 0.0, "Offset value on X-axis")
	flag.Float64Var(&args.offsetY, "offset-y", 0.0, "Offset value on Y-axis")
	flag.Float64Var(&args.offsetZ, "offset-z", 0.0, "Offset value on Z-axis")
	flag.Parse()
}

func main() {
	var args arguments
	parseCommandLine(&args)

	// Open the reference device
	refport, err := serial.Open(args.referenceDevice, args.referenceBaudrate)
	if err != nil {
		logrus.Fatalln(err)
	}
	defer serial.Close(refport)
	ref := reference.ReferenceDriver(&reference.ReferenceDriverImpl{})

	for {
		// Read data from the reference device
		var refState reference.ReferenceState
		err = ref.GetState(refport, [3]float64{args.offsetX, args.offsetY, args.offsetZ}, &refState)
		if err != nil {
			logrus.Errorln(err)
		}

		// Print the reference state
		spew.Dump(refState)
	}
}
