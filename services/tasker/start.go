package tasker

import (
	"time"

	"github.com/bclswl0827/openstation/drivers/gnss"
	"github.com/bclswl0827/openstation/services"
	"github.com/bclswl0827/openstation/utils/logger"
)

func (s *TaskerService) Start(options *services.Options) {
	logger.GetLogger(s.GetTaskName()).Infoln("tracking service has been started")

	var (
		// taskQueue tables.TaskQueue
		gnssTime *gnss.GnssTime
	)
	err := options.Dependency.Invoke(func(deps *gnss.GnssDependency) {
		gnssTime = deps.State.Time
	})
	if err != nil {
		logger.GetLogger(s.GetTaskName()).Warnln("failed to get GNSS time, fallback to system time")
		currentTime := time.Now().UTC()
		gnssTime.BaseTime = currentTime
		gnssTime.RefTime = currentTime
	}

	ticker := time.NewTicker(time.Second)
	defer ticker.Stop()

	for {
		<-ticker.C

		// 每秒查询数据库，获取任务队列
		// 如果当前时间距离任务开始时间小于 3 分钟，则开始执行任务
		// 先将转台设定到引导文件的第一个位置，然后等到任务开始时间，再开始根据引导文件的时间戳执行任务
		// 在此期间转台状态 IsBusy 为 true，表示正在执行任务
		// 任务执行完毕后，将转台状态 IsBusy 为 false，表示空闲
		// 更新数据库中任务队列的状态，将任务队列中的任务状态更新为已完成
	}
}
