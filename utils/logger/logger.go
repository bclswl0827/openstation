package logger

import (
	"reflect"
	"runtime"
	"strings"

	"github.com/sirupsen/logrus"
)

func GetLogger(x any) *logrus.Entry {
	if v, ok := x.(string); ok {
		return logrus.WithFields(logrus.Fields{
			"module": strings.ToLower(v),
		})
	}

	moduleNames := strings.Split((runtime.FuncForPC(reflect.ValueOf(x).Pointer()).Name()), ".")
	module := strings.Split(moduleNames[len(moduleNames)-2], "/")
	if len(module) > 0 {
		return logrus.WithFields(logrus.Fields{
			"module": strings.ToLower(module[len(module)-1]),
		})
	}

	return logrus.WithFields(logrus.Fields{
		"module": "unknown",
	})
}
