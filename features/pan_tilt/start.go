package pan_tilt

import (
	"fmt"
	"time"

	monitorDriver "github.com/bclswl0827/openstation/drivers/monitor"
	"github.com/bclswl0827/openstation/drivers/pan_tilt"
	"github.com/bclswl0827/openstation/drivers/serial"
	"github.com/bclswl0827/openstation/features"
	"github.com/bclswl0827/openstation/features/monitor"
)

func (p *PanTilt) Start(options *features.Options) {
	var (
		deviceName = options.Config.PanTilt.Device
		baudRate   = options.Config.PanTilt.Baud
		driver     = pan_tilt.PanTiltDriver(&pan_tilt.PanTiltDriverImpl{})
	)

	port, err := serial.Open(deviceName, baudRate)
	if err != nil {
		p.OnError(options, err, true)
		return
	}
	p.serialPort = port
	p.OnStart(options)

	// Wait for peripherals to be ready
	for !options.State.Monitor.IsReady || !options.State.Compass.IsReady {
		p.OnEvent(options, "waiting for peripherals to be ready")
		options.MessageBus.Publish(monitor.TOPIC_NAME,
			"Waiting For Peri",
			&monitorDriver.MonitorState{Busy: true, Error: true},
		)

		time.Sleep(5 * time.Second)
	}

	// Check for pan-tilt availablity
	for !driver.IsAvailable(port) {
		p.OnEvent(options, "waiting for pan-tilt to be available")
		options.MessageBus.Publish(monitor.TOPIC_NAME,
			"PanTilt No Avail",
			&monitorDriver.MonitorState{Busy: true, Error: true},
		)

		time.Sleep(5 * time.Second)
	}

	// // Reset pan-tilt device
	// p.OnEvent(options, "pan-tilt is being reset")
	// options.State.PanTilt.IsBusy = true
	// options.MessageBus.Publish(monitor.TOPIC_NAME,
	// 	"PanTilt Reseting",
	// 	&monitorDriver.MonitorState{Busy: true},
	// )
	// resetSig := make(chan bool)
	// err = driver.Reset(port, resetSig)
	// if err != nil {
	// 	options.MessageBus.Publish(monitor.TOPIC_NAME,
	// 		"PanTilt Rst Err",
	// 		&monitorDriver.MonitorState{Error: true},
	// 	)
	// 	p.OnError(options, err, true)
	// 	return
	// }
	// <-resetSig
	// p.OnEvent(options, "pan-tilt has been reset")

	// Set both pan and tilt to 0 degrees
	p.OnEvent(options, "pan-tilt is being initialized")
	options.MessageBus.Publish(monitor.TOPIC_NAME,
		"PanTilt Is Init",
		&monitorDriver.MonitorState{Busy: true},
	)
	err = driver.Init(port)
	if err != nil {
		options.MessageBus.Publish(monitor.TOPIC_NAME,
			"PanTilt Init Err",
			&monitorDriver.MonitorState{Error: true},
		)
		p.OnError(options, err, true)
		return
	}
	p.OnEvent(options, "pan-tilt has been initialized")

	// Find true north direction and get offset angles
	options.MessageBus.Publish(monitor.TOPIC_NAME,
		"PanTilt Find N-S",
		&monitorDriver.MonitorState{},
	)
	p.OnEvent(options, "pan-tilt is finding north")
	panOffset, err := p.FindNorth(port, driver, options.State)
	if err != nil {
		options.MessageBus.Publish(monitor.TOPIC_NAME,
			"PanTilt N-W Err",
			&monitorDriver.MonitorState{Error: true},
		)
		p.OnError(options, err, true)
		return
	}
	options.State.PanTilt.PanOffset = panOffset
	options.State.PanTilt.HasFindNorth = true

	// Set pan-tilt state
	options.State.PanTilt.IsReady = true
	options.State.PanTilt.IsBusy = false
	p.OnEvent(options, fmt.Sprintf(
		"pan-tilt is ready, offset: %.2f, current azimuth: %.2f",
		panOffset,
		options.State.Compass.MagAzimuth,
	))
	options.MessageBus.Publish(monitor.TOPIC_NAME,
		"PanTilt Ready",
		&monitorDriver.MonitorState{},
	)

	// Subscribe to pan-tilt topic
	options.MessageBus.Subscribe(TOPIC_NAME, func() {
		// TODO
	})
}
