package main

import (
	"flag"
	"log"

	"github.com/bclswl0827/openstation/drivers/monitor"
	"github.com/bclswl0827/openstation/drivers/serial"
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

	monitorPort, err := serial.Open(args.monitorDevice, args.monitorBaudrate)
	if err != nil {
		log.Fatalln(err)
	}
	defer serial.Close(monitorPort)

	monitorDependency := &monitor.MonitorDependency{
		Port:  monitorPort,
		State: &monitor.MonitorState{},
	}

	monitorDriver := monitor.MonitorDriver(&monitor.MonitorDriverImpl{})
	err = monitorDriver.Reset(monitorDependency)
	if err != nil {
		log.Fatalln(err)
	}
	log.Println("display screen has been reset")

	err = monitorDriver.Init(monitorDependency)
	if err != nil {
		log.Fatalln(err)
	}
	log.Println("display screen has been initialized")

	err = monitorDriver.Display(monitorDependency, args.displayText, args.startX, args.startY)
	if err != nil {
		log.Fatalln(err)
	}

	log.Printf("current display [%s]\n", args.displayText)
}
