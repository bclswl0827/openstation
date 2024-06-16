package ntp_server

import (
	"net"

	"github.com/bclswl0827/openstation/drivers/gnss"
)

const (
	LI_NO_WARNING      = 0
	LI_ALARM_CONDITION = 3
	VN_FIRST           = 1
	VN_LAST            = 4
	MODE_CLIENT        = 3
	FROM_1900_TO_1970  = 2208988800
)

type UdpTransport struct {
	Conn *net.UDPConn
}

type UdpHandler interface {
	OnData(data []byte, addr net.Addr)
}

type NtpServer struct {
	UdpTransport
	timeSource *gnss.GnssTime
}

type NtpServerService struct {
	udpConn *net.UDPConn
	handler UdpHandler
	timer   []*struct {
		millis int
		callFn func()
	}
}
