package main

import (
	"flag"

	"github.com/bclswl0827/openstation/drivers/monitor"
	"github.com/bclswl0827/openstation/drivers/serial"
	"github.com/sirupsen/logrus"
)

func parseCommandLine(args *arguments) {
	flag.StringVar(&args.monitorDevice, "monitor-device", "/dev/ttyUSB0", "Path to monitor device")
	flag.IntVar(&args.monitorBaudrate, "monitor-baudurate", 9600, "Baudrate for monitor device")
	flag.StringVar(&args.displayText, "display-text", "Hello, World!", "Text to display on the monitor")
	flag.BoolVar(&args.isBusyLED, "set-busy-led", false, "Enable busy LED on board")
	flag.BoolVar(&args.isErrorLED, "set-error-led", false, "Enable error LED on board")
	flag.IntVar(&args.startX, "start-x", 0, "Start position on X-axis")
	flag.IntVar(&args.startY, "start-y", 0, "Start position on Y-axis")
	flag.Parse()
}

func main() {
	var args arguments
	parseCommandLine(&args)

	// Open the monitor device
	monport, err := serial.Open(args.monitorDevice, args.monitorBaudrate)
	if err != nil {
		logrus.Fatalln(err)
	}
	defer serial.Close(monport)
	mon := monitor.MonitorDriver(&monitor.MonitorDriverImpl{})

	// Reset display screen
	logrus.Println("resetting display screen")
	err = mon.Reset(monport)
	if err != nil {
		logrus.Fatalln(err)
	}
	logrus.Println("display screen has been reset")

	// Initialize display screen
	logrus.Println("initializing display screen")
	err = mon.Init(monport)
	if err != nil {
		logrus.Fatalln(err)
	}
	logrus.Println("display screen has been initialized")

	// Display text on the monitor
	err = mon.Display(monport, &monitor.MonitorState{
		Busy:  args.isBusyLED,
		Error: args.isErrorLED,
	}, args.displayText, args.startX, args.startY)
	if err != nil {
		logrus.Fatalln(err)
	}

	logrus.Printf("current display [%s]\n", args.displayText)
}
