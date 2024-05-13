package monitor

import (
	"syscall"

	"github.com/bclswl0827/openstation/features"
	"github.com/sirupsen/logrus"
)

func (*Monitor) OnEvent(_ *features.Options, eventMessage string, args ...any) {
	logrus.Info("monitor: ", eventMessage)
}

func (*Monitor) OnError(options *features.Options, err error, exit bool) {
	logrus.Error("monitor: ", err)
	if exit {
		options.State.SigCh <- syscall.SIGINT
	}
}

func (*Monitor) OnStart(_ *features.Options) {
	logrus.Info("monitor: this feature has been started")
}

func (*Monitor) OnStop(_ *features.Options) {
	logrus.Info("monitor: this feature has been stopped")
}
