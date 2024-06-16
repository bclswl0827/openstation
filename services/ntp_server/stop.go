package ntp_server

import (
	"github.com/bclswl0827/openstation/services"
	"github.com/bclswl0827/openstation/utils/logger"
)

func (p *NtpServerService) Stop(options *services.Options) {
	if options.Config.NTP.Enable && p.udpConn != nil {
		logger.GetLogger(p.Stop).Infoln("stopping built-in NTP server")
		p.udpConn.Close()
	}
}
