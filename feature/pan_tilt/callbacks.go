package pan_tilt

import (
	"os"

	"github.com/bclswl0827/openstation/feature"
	"github.com/sirupsen/logrus"
)

func (*PanTilt) OnEvent(_ *feature.Options, eventMessage string, args ...any) {
	logrus.Info("pantilt: ", eventMessage)
}

func (*PanTilt) OnError(_ *feature.Options, err error, exit bool) {
	logrus.Error("pantilt: ", err)
	if exit {
		os.Exit(1)
	}
}

func (*PanTilt) OnStart(_ *feature.Options) {
	logrus.Info("pantilt: this feature has been started")
}

func (*PanTilt) OnStop(_ *feature.Options) {
	logrus.Info("pantilt: this feature has been stopped")
}
