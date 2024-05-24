package main

import (
	"flag"
	"log"

	"github.com/bclswl0827/openstation/drivers/pan_tilt"
	"github.com/bclswl0827/openstation/drivers/serial"
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

	panTiltPort, err := serial.Open(args.pantiltDevice, args.pantiltBaudrate)
	if err != nil {
		log.Fatalln(err)
	}
	defer serial.Close(panTiltPort)

	panTiltDependency := &pan_tilt.PanTiltDependency{
		Port: panTiltPort,
	}
	panTiltDriver := pan_tilt.PanTiltDriver(&pan_tilt.PanTiltDriverImpl{})

	if !panTiltDriver.IsAvailable(panTiltDependency) {
		log.Fatalln("pan-tilt device is not available")
	}

	if args.reset {
		log.Println("pan-tilt device is being reset")
		sig := make(chan bool)
		panTiltDriver.Reset(panTiltDependency, sig)
		<-sig
	}

	log.Println("pan-tilt device is being initialized")
	err = panTiltDriver.Init(panTiltDependency)
	if err != nil {
		log.Fatalln(err)
	}
	log.Println("pan-tilt device has been initialized")

	log.Println("pan-tilt device is moving to specified position")
	sig := make(chan bool)
	err = panTiltDriver.SetPan(panTiltDependency, args.pan, sig)
	if err != nil {
		log.Fatalln(err)
	}

	<-sig
	log.Printf("current pan value: %f", args.pan)

	err = panTiltDriver.SetTilt(panTiltDependency, args.tilt, sig)
	if err != nil {
		log.Fatalln(err)
	}

	<-sig
	log.Printf("current tilt value: %f", args.tilt)
}
