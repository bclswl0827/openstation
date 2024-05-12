package monitor

import (
	"syscall"

	"github.com/bclswl0827/openstation/feature"
	"github.com/sirupsen/logrus"
)

func (*Monitor) OnEvent(_ *feature.Options, eventMessage string, args ...any) {
	logrus.Info("monitor: ", eventMessage)
}

func (*Monitor) OnError(options *feature.Options, err error, exit bool) {
	logrus.Error("monitor: ", err)
	if exit {
		options.State.SigCh <- syscall.SIGINT
	}
}

func (*Monitor) OnStart(_ *feature.Options) {
	logrus.Info("monitor: this feature has been started")
}

func (*Monitor) OnStop(_ *feature.Options) {
	logrus.Info("monitor: this feature has been stopped")
}
