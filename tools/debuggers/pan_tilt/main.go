package main

import (
	"flag"

	"github.com/bclswl0827/openstation/drivers/pan_tilt"
	"github.com/bclswl0827/openstation/drivers/serial"
	"github.com/sirupsen/logrus"
)

func parseCommandLine(args *arguments) {
	flag.StringVar(&args.pantiltDevice, "pantilt-device", "/dev/ttyUSB0", "Path to pan-tilt device")
	flag.IntVar(&args.pantiltBaudrate, "pantilt-baudurate", 9600, "Baudrate for monitor device")
	flag.Float64Var(&args.pan, "pan", 0.0, "Pan value")
	flag.Float64Var(&args.tilt, "tilt", 90.0, "Tilt value")
	flag.BoolVar(&args.reset, "reset", false, "Reset pan-tilt device")
	flag.Parse()
}

func main() {
	var args arguments
	parseCommandLine(&args)

	// Open the monitor device
	ptport, err := serial.Open(args.pantiltDevice, args.pantiltBaudrate)
	if err != nil {
		logrus.Fatalln(err)
	}
	defer serial.Close(ptport)
	pt := pan_tilt.PanTiltDriver(&pan_tilt.PanTiltDriverImpl{})

	// Check if the pan-tilt device is available
	if !pt.IsAvailable(ptport) {
		logrus.Fatalln("pan-tilt device is not available")
	}

	// Reset pan-tilt device if requested
	if args.reset {
		// Reset and initialize pan-tilt device first
		logrus.Info("pan-tilt device is being reset")
		sig := make(chan bool)
		pt.Reset(ptport, sig)
		<-sig
	}

	// Initialize pan-tilt device to default position
	logrus.Info("pan-tilt device is being initialized")
	err = pt.Init(ptport)
	if err != nil {
		logrus.Fatalln(err)
	}
	logrus.Info("pan-tilt device has been initialized")

	// Move pan-tilt device to the specified position
	logrus.Info("pan-tilt device is moving to specified position")
	sig := make(chan bool)
	err = pt.SetPan(ptport, args.pan, 0, sig)
	if err != nil {
		logrus.Fatalln(err)
	}

	<-sig
	logrus.Infof("current pan value: %f", args.pan)

	err = pt.SetTilt(ptport, args.tilt, sig)
	if err != nil {
		logrus.Fatalln(err)
	}

	<-sig
	logrus.Infof("current tilt value: %f", args.tilt)
}
