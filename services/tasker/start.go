package tasker

import (
	"github.com/bclswl0827/openstation/services"
	"github.com/bclswl0827/openstation/utils/logger"
)

func (s *TaskerService) Start(options *services.Options) {
	logger.GetLogger(s.GetTaskName()).Infoln("tracking service has been started")
	// var (
	// 	gnssDependency *gnss.GnssDependency
	// 	taskQueue      tables.TaskQueue
	// )
	// options.Dependency.Invoke(func(deps *gnss.GnssDependency) {
	// 	gnssDependency = deps
	// })

	// ticker := time.NewTicker(time.Second)
	// defer ticker.Stop()

	// for {
	// 	<-ticker.C

	// 	currentTime, err := gnssDependency.State.Time.GetTime()
	// 	if err != nil {
	// 		logger.GetLogger(s.GetTaskName()).Errorln("failed to get GNSS time, retrying...")
	// 		continue
	// 	}

	// 	err = options.Database.
	// 		Table(taskQueue.GetName()).
	// 		Where("has_done = ? AND start_time <= ?", false, currentTime.UnixMilli()).
	// 		Order("start_time ASC").
	// 		First(&taskQueue).
	// 		Error
	// 	if err != nil {
	// 		logger.GetLogger(s.GetTaskName()).Errorln("failed to get task queue, retrying...")
	// 		continue
	// 	}

	// 	// 如果当前时间距离任务开始时间小于 1 分钟，则开始执行任务
	// 	if taskQueue.StartTime-currentTime.UnixMilli() < 60*1000 {
	// 		logger.GetLogger(s.GetTaskName()).Infoln("start to execute task queue", taskQueue.ID)
	// 	}
	// }
}
