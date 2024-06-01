package forecast

import (
	"fmt"
	"time"

	"github.com/bclswl0827/openstation/drivers/dao/table"
	"github.com/bclswl0827/openstation/drivers/gnss"
	"github.com/bclswl0827/openstation/drivers/tle"
	"github.com/bclswl0827/openstation/services"
	"github.com/bclswl0827/openstation/utils/logger"
	"gorm.io/gorm"
)

func (s *ForecastService) Start(options *services.Options) {
	for {
		var (
			latitude    float64
			longitude   float64
			currentTime time.Time
		)
		err := options.Dependency.Invoke(func(deps *gnss.GnssDependency) error {
			latitude, longitude = deps.State.Latitude, deps.State.Longitude
			t, err := deps.State.Time.GetTime()
			if err != nil {
				return err
			}
			currentTime = t
			return nil
		})
		if err == nil {
			// Remove expired forecast data
			logger.GetLogger(s.GetTaskName()).Infoln("cleaning up expired forecast data")
			var forecastModel table.TransitForecast
			err := options.Database.Transaction(func(tx *gorm.DB) error {
				return tx.Table(forecastModel.GetName()).
					Select("*").
					Where("epoch_time < ?", currentTime.UnixMilli()).
					Delete(forecastModel).
					Error
			})
			if err != nil {
				logger.GetLogger(s.GetTaskName()).Errorln(err)
			}
		} else {
			logger.GetLogger(s.GetTaskName()).Errorln(err)
		}

		// Choose non-geostationary satellites in transit_forecast table, and forecast their transit
		logger.GetLogger(s.GetTaskName()).Infof("forecasting satellite transit from %s to %s",
			currentTime.Format(time.RFC3339),
			currentTime.Add(24*time.Hour).Format(time.RFC3339),
		)
		options.Database.Transaction(func(tx *gorm.DB) error {
			var (
				tleModel   table.SatelliteTLE
				tleRecords []table.SatelliteTLE
			)
			tx.Table(tleModel.GetName()).
				Select("*").
				Where("geostationary = ?", false).
				Find(&tleRecords)
			for _, satellite := range tleRecords {
				var (
					satelliteTle tle.TLE
					satelliteObj tle.Satellite
				)
				err := satelliteTle.Load(fmt.Sprintf(
					"%s\n%s\n%s",
					satellite.Name,
					satellite.Line_1,
					satellite.Line_2,
				))
				if err != nil {
					logger.GetLogger(s.GetTaskName()).Errorln(err)
					continue
				}
				satelliteObserver := tle.Observer{
					Latitude:  latitude,
					Longitude: longitude,
				}
				dat, err := satelliteObj.Predict(&satelliteTle, &satelliteObserver, currentTime, currentTime.Add(time.Hour*24), time.Minute)
				if err != nil {
					logger.GetLogger(s.GetTaskName()).Errorln(err)
				}
				for _, transit := range dat {
					forecastModel := table.TransitForecast{
						Latitude:     latitude,
						Longitude:    longitude,
						ID:           satellite.ID,
						Name:         satellite.Name,
						EpochTime:    satellite.EpochTime,
						EntryAzimuth: transit.EntryAzimuth,
						MaxElevation: transit.MaxElevation,
						EndTime:      transit.EndTime.UnixMilli(),
						StartTime:    transit.StartTime.UnixMilli(),
					}
					err := tx.Table(forecastModel.GetName()).Create(&forecastModel).Error
					if err != nil {
						logger.GetLogger(s.GetTaskName()).Errorln(err)
					}
				}
			}

			return nil
		})

		logger.GetLogger(s.GetTaskName()).Infoln("next forecast task will be executed in 1 hour")
		time.Sleep(time.Hour)
	}
}

func (s *ForecastService) OnStart() {
	logger.GetLogger(s.GetTaskName()).Infoln("forecast service has been started")
}
