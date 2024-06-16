package tasker

import (
	"github.com/bclswl0827/openstation/services"
	"github.com/bclswl0827/openstation/utils/logger"
)

func (s *TaskerService) Stop(options *services.Options) {
	logger.GetLogger(s.GetTaskName()).Infoln("service has been stopped")
}
