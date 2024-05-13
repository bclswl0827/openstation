package pan_tilt

import (
	"syscall"

	"github.com/bclswl0827/openstation/features"
	"github.com/sirupsen/logrus"
)

func (*PanTilt) OnEvent(_ *features.Options, eventMessage string, args ...any) {
	logrus.Info("pantilt: ", eventMessage)
}

func (*PanTilt) OnError(options *features.Options, err error, exit bool) {
	logrus.Error("pantilt: ", err)
	if exit {
		options.State.SigCh <- syscall.SIGINT
	}
}

func (*PanTilt) OnStart(_ *features.Options) {
	logrus.Info("pantilt: this feature has been started")
}

func (*PanTilt) OnStop(_ *features.Options) {
	logrus.Info("pantilt: this feature has been stopped")
}
