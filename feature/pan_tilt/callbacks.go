package pan_tilt

import (
	"syscall"

	"github.com/bclswl0827/openstation/feature"
	"github.com/sirupsen/logrus"
)

func (*PanTilt) OnEvent(_ *feature.Options, eventMessage string, args ...any) {
	logrus.Info("pantilt: ", eventMessage)
}

func (*PanTilt) OnError(options *feature.Options, err error, exit bool) {
	logrus.Error("pantilt: ", err)
	if exit {
		options.State.SigCh <- syscall.SIGINT
	}
}

func (*PanTilt) OnStart(_ *feature.Options) {
	logrus.Info("pantilt: this feature has been started")
}

func (*PanTilt) OnStop(_ *feature.Options) {
	logrus.Info("pantilt: this feature has been stopped")
}
