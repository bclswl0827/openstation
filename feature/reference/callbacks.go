package reference

import (
	"syscall"

	"github.com/bclswl0827/openstation/feature"
	"github.com/sirupsen/logrus"
)

func (*Reference) OnEvent(_ *feature.Options, eventMessage string, args ...any) {
	logrus.Info("reference: ", eventMessage)
}

func (*Reference) OnError(options *feature.Options, err error, exit bool) {
	logrus.Error("reference: ", err)
	if exit {
		options.State.SigCh <- syscall.SIGINT
	}
}

func (*Reference) OnStart(_ *feature.Options) {
	logrus.Info("reference: this feature has been started")
}

func (*Reference) OnStop(_ *feature.Options) {
	logrus.Info("reference: this feature has been stopped")
}
