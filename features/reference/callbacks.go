package reference

import (
	"syscall"

	"github.com/bclswl0827/openstation/features"
	"github.com/sirupsen/logrus"
)

func (*Reference) OnEvent(_ *features.Options, eventMessage string, args ...any) {
	logrus.Info("reference: ", eventMessage)
}

func (*Reference) OnError(options *features.Options, err error, exit bool) {
	logrus.Error("reference: ", err)
	if exit {
		options.State.SigCh <- syscall.SIGINT
	}
}

func (*Reference) OnStart(_ *features.Options) {
	logrus.Info("reference: this feature has been started")
}

func (*Reference) OnStop(_ *features.Options) {
	logrus.Info("reference: this feature has been stopped")
}
