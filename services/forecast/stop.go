package forecast

import (
	"github.com/bclswl0827/openstation/services"
	"github.com/bclswl0827/openstation/utils/logger"
)

func (s *ForecastService) Stop(options *services.Options) {
	logger.GetLogger(s.GetTaskName()).Infoln("forecast service is stopping")
}

func (s *ForecastService) OnStop() {
	logger.GetLogger(s.GetTaskName()).Infoln("forecast service has been stopped")
}