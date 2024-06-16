package ntp_server

import (
	"fmt"
	"net"
	"runtime"
	"time"

	"github.com/bclswl0827/openstation/drivers/gnss"
	"github.com/bclswl0827/openstation/services"
	"github.com/bclswl0827/openstation/utils/logger"
)

func (p *NtpServerService) Start(options *services.Options) {
	if !options.Config.NTP.Enable {
		logger.GetLogger(p.GetTaskName()).Infoln("built-in NTP server is disabled")
		return
	}
	logger.GetLogger(p.GetTaskName()).Infoln("built-in NTP server has been started")

	listenAddr, err := net.ResolveUDPAddr("udp", fmt.Sprintf(":%d", options.Config.NTP.Port))
	if err != nil {
		logger.GetLogger(p.GetTaskName()).Errorln(err)
		return
	}

	conn, err := net.ListenUDP("udp", listenAddr)
	if err != nil {
		logger.GetLogger(p.GetTaskName()).Errorln(err)
		return
	}
	p.udpConn = conn

	// Get the time source pointer
	var gnssTimeSource *gnss.GnssTime
	err = options.Dependency.Invoke(func(deps *gnss.GnssDependency) {
		gnssTimeSource = deps.State.Time
	})
	if err != nil {
		logger.GetLogger(p.GetTaskName()).Errorln(err)
		return
	}

	// Create a new NtpServer instance and set the transport to UdpTransport
	handler := &NtpServer{timeSource: gnssTimeSource}
	handler.UdpTransport = UdpTransport{Conn: conn}
	p.handler = handler

	go func() {
		for {
			data := make([]byte, 512)
			read_length, remoteAddr, err := conn.ReadFromUDP(data[0:])
			if err != nil {
				return
			}
			if read_length > 0 {
				defer recover()
				go p.handler.OnData(data[0:read_length], remoteAddr)
			}
		}
	}()

	for len(p.timer) > 0 {
		caller := p.timer[0]
		p.timer = p.timer[1:]
		<-time.After(time.Duration(caller.millis) * time.Millisecond)
		caller.callFn()
	}

	logger.GetLogger(p.GetTaskName()).Infof("built-in NTP server is listening on 0.0.0.0:%d", options.Config.NTP.Port)
	for {
		runtime.Gosched()
	}
}
