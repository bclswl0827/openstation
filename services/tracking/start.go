package tracking

import (
	"github.com/bclswl0827/openstation/services"
	"github.com/bclswl0827/openstation/utils/logger"
)

func (s *TrackingService) Start(options *services.Options) {
}

func (s *TrackingService) OnStart() {
	logger.GetLogger(s.OnStart).Infoln("start")
}
