package monitor

import (
	"github.com/bclswl0827/openstation/feature"
	"github.com/sirupsen/logrus"
)

func (*Monitor) OnError(_ *feature.Options, err error, args ...any) {
	logrus.Error("display: ", err)
}

func (*Monitor) OnMessage(_ *feature.Options, msg string, args ...any) {
	logrus.Info("display: ", msg)
}
