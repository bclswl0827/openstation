package main

import (
	"flag"
	"log"

	"github.com/bclswl0827/openstation/drivers/gnss"
	"github.com/bclswl0827/openstation/drivers/serial"
	"github.com/davecgh/go-spew/spew"
)

func parseCommandLine(args *arguments) {
	flag.StringVar(&args.gnssDevice, "gnss-device", "/dev/ttyUSB0", "Path to GNSS device")
	flag.IntVar(&args.gnssBaudrate, "gnss-baudurate", 9600, "Baudrate for GNSS device")
	flag.Float64Var(&args.gnssBaseline, "gnss-baseline", 1, "Baseline for GNSS device")
	flag.Parse()
}

func main() {
	var args arguments
	parseCommandLine(&args)

	gnssPort, err := serial.Open(args.gnssDevice, args.gnssBaudrate)
	if err != nil {
		log.Fatalln(err)
	}
	defer gnssPort.Close()

	gnssDependency := &gnss.GnssDependency{
		Port:  gnssPort,
		State: &gnss.GnssState{},
	}
	gnssDriver := gnss.GnssDriver(&gnss.GnssDriverImpl{})

	if args.gnssBaseline != 0 {
		log.Println("setting GNSS antenna baseline")
		err = gnssDriver.SetBaseline(gnssDependency, args.gnssBaseline)
		if err != nil {
			log.Fatalln(err)
		}
	}

	for {
		err = gnssDriver.GetState(gnssDependency)
		if err != nil {
			log.Fatalln(err)
		}

		spew.Dump(gnssDependency.State)
	}
}
