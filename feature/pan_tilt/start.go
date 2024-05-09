package pan_tilt

import (
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	monitorDriver "github.com/bclswl0827/openstation/driver/monitor"
	"github.com/bclswl0827/openstation/driver/pan_tilt"
	"github.com/bclswl0827/openstation/driver/serial"
	"github.com/bclswl0827/openstation/feature"
	"github.com/bclswl0827/openstation/feature/monitor"
)

func (p *PanTilt) Start(options *feature.Options, waitGroup *sync.WaitGroup) {
	var (
		deviceName = options.Config.PanTilt.Device
		baudRate   = options.Config.PanTilt.Baud
		driver     = pan_tilt.PanTilt(&pan_tilt.PanTiltImpl{})
	)

	port, err := serial.Open(deviceName, baudRate)
	if err != nil {
		p.OnError(options, err, true)
	}
	p.serialPort = port
	waitGroup.Add(1)
	p.OnStart(options)

	// Wait for monitor to be ready
	for !options.State.Monitor.IsReady {
		p.OnEvent(options, "waiting for monitor to be ready")
		time.Sleep(time.Second)
	}

	// Check for pan-tilt availablity
	for !driver.IsAvailable(port) {
		p.OnEvent(options, "waiting for pan-tilt to be available")
		options.MessageBus.Publish(monitor.TOPIC_NAME,
			"PanTilt No Avail",
			monitorDriver.MonitorState{Busy: true, Error: true},
		)

		time.Sleep(5 * time.Second)
	}

	// Reset pan-tilt device
	p.OnEvent(options, "pan-tilt is being reset")
	options.State.PanTilt.IsBusy = true
	options.MessageBus.Publish(monitor.TOPIC_NAME,
		"PanTilt Reseting",
		monitorDriver.MonitorState{Busy: true},
	)
	err = driver.Reset(port)
	if err != nil {
		options.MessageBus.Publish(monitor.TOPIC_NAME,
			"PanTilt Rst Err",
			monitorDriver.MonitorState{Error: true},
		)
		p.OnError(options, err, true)
	}
	p.OnEvent(options, "pan-tilt has been reset")

	// Set both pan and tilt to 0 degrees
	p.OnEvent(options, "pan-tilt is being initialized")
	options.MessageBus.Publish(monitor.TOPIC_NAME,
		"PanTilt Is Init",
		monitorDriver.MonitorState{Busy: true},
	)
	err = driver.Init(port)
	if err != nil {
		options.MessageBus.Publish(monitor.TOPIC_NAME,
			"PanTilt Init Err",
			monitorDriver.MonitorState{Error: true},
		)
		p.OnError(options, err, true)
	}
	p.OnEvent(options, "pan-tilt has been initialized")

	// Find true north direction and get offset angles
	options.MessageBus.Publish(monitor.TOPIC_NAME,
		"PanTilt Find NW",
		monitorDriver.MonitorState{},
	)
	p.OnEvent(options, "pan-tilt is finding north")
	err = p.FindNorth()
	if err != nil {
		options.MessageBus.Publish(monitor.TOPIC_NAME,
			"PanTilt N-W Err",
			monitorDriver.MonitorState{Error: true},
		)
		p.OnError(options, err, true)
	}

	// Set pan-tilt state
	options.State.PanTilt.IsReady = true
	options.State.PanTilt.IsBusy = false
	options.MessageBus.Publish(monitor.TOPIC_NAME,
		"PanTilt Ready",
		monitorDriver.MonitorState{},
	)
	p.OnEvent(options, "pan-tilt is ready for operation")

	// Receive interrupt signals
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, os.Interrupt, syscall.SIGTERM)

	// Wait for interrupt signals
	<-sigCh
	p.OnStop(options)
}
