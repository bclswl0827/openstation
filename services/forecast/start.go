package forecast

import (
	"github.com/bclswl0827/openstation/services"
	"github.com/bclswl0827/openstation/utils/logger"
	"gorm.io/gorm"
)

func (s *ForecastService) Start(options *services.Options) {
	// var currentTimeSec int64
	// options.Dependency.Invoke(func(deps *gnss.GnssDependency) error {
	// 	t, err := deps.State.Time.GetTime()
	// 	if err != nil {
	// 		return err
	// 	}

	// 	currentTimeSec = t.Unix()
	// 	return nil
	// })
	err := options.Database.Transaction(func(tx *gorm.DB) error {
		// 移除 TransitForcast 表中，所有 EpochTime 超过 3 日整的数据
		// tx.Where("epoch_time < ?", currentTimeSec-int64(tle.EXPIRATION_DAYS.Seconds())).Delete()
		return nil
	})
	if err != nil {
		logger.GetLogger(s.Start).Errorln(err)
	}
}

func (s *ForecastService) OnStart() {
	logger.GetLogger(s.OnStart).Infoln("start")
}
