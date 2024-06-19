package tasker

import (
	"encoding/json"
	"time"

	"github.com/bclswl0827/openstation/drivers/dao/tables"
	"github.com/bclswl0827/openstation/drivers/gnss"
	"github.com/bclswl0827/openstation/drivers/pan_tilt"
	"github.com/bclswl0827/openstation/drivers/tle"
	"github.com/bclswl0827/openstation/services"
	"github.com/bclswl0827/openstation/utils/logger"
)

func (s *TaskerService) Start(options *services.Options) {
	logger.GetLogger(s.GetTaskName()).Infoln("tracking service has been started")
	panTiltDriver := pan_tilt.PanTiltDriver(&pan_tilt.PanTiltDriverImpl{})

	var (
		gnssTime    *gnss.GnssTime
		panTiltDeps *pan_tilt.PanTiltDependency
	)
	err := options.Dependency.Invoke(func(gnss *gnss.GnssDependency, panTilt *pan_tilt.PanTiltDependency) {
		gnssTime = gnss.State.Time
		panTiltDeps = panTilt
	})
	if err != nil {
		logger.GetLogger(s.GetTaskName()).Errorf("failed to get dependencies for tasker service: %v", err)
		return
	}

	ticker := time.NewTicker(time.Second)
	defer ticker.Stop()

	for {
		<-ticker.C
		var taskRecord tables.TaskQueue

		// Get current time
		currentTime, err := gnssTime.GetTime()
		if err != nil {
			logger.GetLogger(s.GetTaskName()).Errorf("failed to get current time: %v", err)
			continue
		}

		// Get upcoming task
		err = options.Database.
			Table(taskRecord.GetName()).
			Where("start_time >= ?", currentTime.UnixMilli()).
			Order("start_time ASC").
			Find(&taskRecord).
			Error
		if err != nil {
			logger.GetLogger(s.GetTaskName()).Errorf("failed to get task queue: %v", err)
			continue
		}
		if taskRecord.ID == 0 {
			continue
		}

		timeDiff := taskRecord.StartTime - currentTime.UnixMilli()
		if timeDiff <= 3*60*1000 {
			panTiltDeps.IsBusy = true
			logger.GetLogger(s.GetTaskName()).Infof("starting to handle upcoming task: %s, id: %d", taskRecord.Name, taskRecord.ID)

			// Get task bootstrap data
			var bootstrap []tle.Bootstrap
			err = json.Unmarshal([]byte(taskRecord.Bootstrap), &bootstrap)
			if err != nil {
				logger.GetLogger(s.GetTaskName()).Errorf("failed to unmarshal bootstrap data: %v", err)
				continue
			}
			if len(bootstrap) < 2 {
				logger.GetLogger(s.GetTaskName()).Errorf("bootstrap data for task %s is empty", taskRecord.Name)
				continue
			}

			// Set Pan-Tilt to first position
			err = panTiltDriver.SetPan(panTiltDeps, bootstrap[0].Azimuth)
			if err != nil {
				logger.GetLogger(s.GetTaskName()).Errorf("failed to set Pan-Tilt pan: %v", err)
				continue
			}
			err = panTiltDriver.SetTilt(panTiltDeps, 90-bootstrap[0].Elevation)
			if err != nil {
				logger.GetLogger(s.GetTaskName()).Errorf("failed to set Pan-Tilt tilt: %v", err)
				continue
			}

			// Print task countdown
			if timeDiff > 0 {
				countDownTicker := time.NewTicker(time.Second)
				for {
					<-countDownTicker.C

					// Update current time
					currentTime, err = gnssTime.GetTime()
					if err != nil {
						logger.GetLogger(s.GetTaskName()).Errorf("failed to get current time: %v", err)
						continue
					}

					// Get countdown in seconds
					countDown := taskRecord.StartTime - currentTime.UnixMilli()
					logger.GetLogger(s.GetTaskName()).Infof("task countdown for %s: %d seconds", taskRecord.Name, countDown/1000)

					if countDown < 1 {
						logger.GetLogger(s.GetTaskName()).Infof("task %s is due to start", taskRecord.Name)
						countDownTicker.Stop()
						break
					}
				}
			} else {
				logger.GetLogger(s.GetTaskName()).Infof("task %s is already due to start", taskRecord.Name)
			}

			// Execute the task according to the bootstrap timestamps
			for _, setp := range bootstrap[1:] {
				// Update current time
				currentTime, err = gnssTime.GetTime()
				if err != nil {
					logger.GetLogger(s.GetTaskName()).Errorf("failed to get current time: %v", err)
					continue
				}

				// Wait until the bootstrap timestamp
				timeDiff := setp.Timestamp - currentTime.UnixMilli()
				if timeDiff > 0 {
					time.Sleep(time.Duration(timeDiff) * time.Millisecond)
				}

				// Set Pan-Tilt to the bootstrap position
				err = panTiltDriver.SetPan(panTiltDeps, setp.Azimuth)
				if err != nil {
					logger.GetLogger(s.GetTaskName()).Errorf("failed to set Pan-Tilt pan: %v", err)
					continue
				}
				err = panTiltDriver.SetTilt(panTiltDeps, 90-setp.Elevation)
				if err != nil {
					logger.GetLogger(s.GetTaskName()).Errorf("failed to set Pan-Tilt tilt: %v", err)
					continue
				}

				logger.GetLogger(s.GetTaskName()).Infof("task %s: current azimuth: %.2f, elevation: %.2f, progress: %.2f%%",
					taskRecord.Name,
					setp.Azimuth,
					setp.Elevation,
					float64(setp.Timestamp-taskRecord.StartTime)/float64(taskRecord.EndTime-taskRecord.StartTime)*100,
				)
			}

			// Update task queue status
			err = options.Database.
				Table(taskRecord.GetName()).
				Where("id = ?", taskRecord.ID).
				Update("has_done", true).
				Error
			if err != nil {
				logger.GetLogger(s.GetTaskName()).Errorf("failed to update task queue: %v", err)
				continue
			}

			// Set Pan-Tilt to zero position
			panTiltDriver.SetPan(panTiltDeps, 0)
			panTiltDriver.SetTilt(panTiltDeps, 0)

			// Reset Pan-Tilt busy state
			panTiltDeps.IsBusy = false
			logger.GetLogger(s.GetTaskName()).Infof("task %s has been completed, id: %d", taskRecord.Name, taskRecord.ID)
		} else {
			if (timeDiff/1000)%10 == 0 {
				logger.GetLogger(s.GetTaskName()).Infof("task %s is not due yet, id: %d, countdown: %d seconds", taskRecord.Name, taskRecord.ID, timeDiff/1000)
			}
		}
	}
}
