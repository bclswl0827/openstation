package reference

import (
	"github.com/bclswl0827/openstation/feature"
	"github.com/sirupsen/logrus"
)

func (*Reference) OnError(_ *feature.Options, err error, args ...any) {
	logrus.Error("reference: ", err)
}

func (*Reference) OnMessage(_ *feature.Options, msg string, args ...any) {
	logrus.Info("reference: ", msg)
}
