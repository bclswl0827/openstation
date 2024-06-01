package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
// Code generated by github.com/99designs/gqlgen version v0.17.47

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/bclswl0827/openstation/drivers/dao/table"
	"github.com/bclswl0827/openstation/drivers/gnss"
	"github.com/bclswl0827/openstation/drivers/pan_tilt"
	"github.com/bclswl0827/openstation/drivers/tle"
	"github.com/bclswl0827/openstation/graph/model"
	"github.com/bclswl0827/openstation/startups"
	"github.com/bclswl0827/openstation/startups/alignment"
	"github.com/bclswl0827/openstation/utils/logger"
	"github.com/bclswl0827/openstation/utils/system"
	"gorm.io/gorm"
)

// SetPanTilt is the resolver for the setPanTilt field.
func (r *mutationResolver) SetPanTilt(ctx context.Context, newPan float64, newTilt float64, sync bool) (bool, error) {
	driver := pan_tilt.PanTiltDriver(&pan_tilt.PanTiltDriverImpl{})
	err := r.Dependency.Invoke(func(deps *pan_tilt.PanTiltDependency) error {
		if sync {
			sig := make(chan bool)
			err := driver.SetPan(deps, newPan, sig)
			if err != nil {
				return err
			}
			<-sig
			err = driver.SetTilt(deps, newTilt, sig)
			if err != nil {
				return err
			}
			<-sig
		} else {
			err := driver.SetPan(deps, newPan, nil)
			if err != nil {
				return err
			}
			err = driver.SetTilt(deps, newTilt, nil)
			if err != nil {
				return err
			}
		}

		return nil
	})
	if err != nil {
		logger.GetLogger(r.SetPanTilt).Warn(err)
		return false, err
	}

	return true, nil
}

// SetPanTiltToNorth is the resolver for the SetPanTiltToNorth field.
func (r *mutationResolver) SetPanTiltToNorth(ctx context.Context) (bool, error) {
	// Check if the Pan-Tilt is busy
	var isBusy bool
	err := r.Dependency.Invoke(func(deps *pan_tilt.PanTiltDependency) error {
		isBusy = deps.IsBusy
		return nil
	})
	if err != nil {
		logger.GetLogger(r.SetPanTiltToNorth).Warn(err)
		return false, err
	}
	if isBusy {
		err = errors.New("Pan-Tilt is busy")
		logger.GetLogger(r.SetPanTiltToNorth).Warn(err)
		return false, err
	}

	// Use alignment task in startup directly
	var alignment alignment.AlignmentStartupTask
	go alignment.Execute(r.Dependency, &startups.Options{
		Config:   r.Config,
		Database: r.Database,
	})

	return true, nil
}

// SetAllTLEs is the resolver for the SetAllTLEs field.
func (r *mutationResolver) SetAllTLEs(ctx context.Context, tleData string, overwrite bool) (int, error) {
	// Get current time from GNSS
	var currentTime time.Time
	err := r.Dependency.Invoke(func(deps *gnss.GnssDependency) error {
		t, err := deps.State.Time.GetTime()
		if err != nil {
			return err
		}
		currentTime = t
		return nil
	})
	if err != nil {
		logger.GetLogger(r.SetAllTLEs).Warn(err)
		return -1, err
	}

	// Split TLE data to group
	tleDataArr := strings.Split(tleData, "\n")
	var tleDataGroup []string
	for i := 0; i < len(tleDataArr); i += 3 {
		if i+3 > len(tleDataArr) {
			break
		}
		tleDataGroup = append(tleDataGroup, strings.Join(tleDataArr[i:i+3], "\n"))
	}

	// Insert TLE records to database
	var (
		tleModel       table.SatelliteTLE
		failedTLECount int
	)
	err = r.Database.Transaction(func(tx *gorm.DB) error {
		// Clear all TLE records before adding new ones
		if overwrite {
			err := tx.
				Table(tleModel.GetName()).
				Select("*").
				Where("id = id").
				Delete(tleModel).
				Error
			if err != nil {
				return err
			}
		}

		// Parse and insert each TLE record by group
		for _, tleInput := range tleDataGroup {
			var (
				inputTLE       tle.TLE
				mockObserver   tle.Observer
				inputSatellite tle.Satellite
			)
			err := inputTLE.Load(tleInput)
			if err != nil {
				logger.GetLogger(r.SetAllTLEs).Warn(err)
				failedTLECount++
				continue
			}

			mockObserver.Latitude = -1
			mockObserver.Longitude = -1
			err = inputSatellite.Parse(&inputTLE, &mockObserver, currentTime)
			if err != nil {
				logger.GetLogger(r.SetAllTLEs).Warn(err)
				failedTLECount++
				continue
			}

			record := table.SatelliteTLE{
				ID:            inputTLE.ID,
				Name:          inputTLE.Name,
				Line_1:        inputTLE.Line_1,
				Line_2:        inputTLE.Line_2,
				EpochTime:     inputSatellite.EpochTime.UnixMilli(),
				Geostationary: inputSatellite.Geostationary,
			}
			if overwrite {
				// Insert directly if overwrite is enabled
				err = tx.
					Table(record.GetName()).
					Create(&record).
					Error
				if err != nil {
					return err
				}
			} else {
				// Insert if not exists, otherwise update
				err = tx.
					Table(record.GetName()).
					Where("id = ?", record.ID).
					Assign(record).
					FirstOrCreate(&record).
					Error
				if err != nil {
					return err
				}
			}
		}

		return nil
	})
	if err != nil {
		logger.GetLogger(r.SetAllTLEs).Warn(err)
		return -1, err
	}

	return failedTLECount, nil
}

// AddNewTle is the resolver for the AddNewTLE field.
func (r *mutationResolver) AddNewTle(ctx context.Context, tleData string) (bool, error) {
	// Get current time from GNSS
	var currentTime time.Time
	err := r.Dependency.Invoke(func(deps *gnss.GnssDependency) error {
		t, err := deps.State.Time.GetTime()
		if err != nil {
			return err
		}
		currentTime = t
		return nil
	})
	if err != nil {
		logger.GetLogger(r.AddNewTle).Warn(err)
		return false, err
	}

	// Parse input TLE data
	var (
		inputTLE       tle.TLE
		mockObserver   tle.Observer
		inputSatellite tle.Satellite
	)
	err = inputTLE.Load(tleData)
	if err != nil {
		logger.GetLogger(r.AddNewTle).Warn(err)
		return false, err
	}

	mockObserver.Latitude = -1
	mockObserver.Longitude = -1
	err = inputSatellite.Parse(&inputTLE, &mockObserver, currentTime)
	if err != nil {
		logger.GetLogger(r.AddNewTle).Warn(err)
		return false, err
	}

	// Insert TLE record to database
	tleRecord := table.SatelliteTLE{
		ID:            inputTLE.ID,
		Name:          inputTLE.Name,
		Line_1:        inputTLE.Line_1,
		Line_2:        inputTLE.Line_2,
		EpochTime:     inputSatellite.EpochTime.UnixMilli(),
		Geostationary: inputSatellite.Geostationary,
	}
	err = r.Database.
		Table(tleRecord.GetName()).
		Create(&tleRecord).
		Error
	if err != nil {
		logger.GetLogger(r.AddNewTle).Warn(err)
		return false, err
	}

	return true, nil
}

// DeleteTLEByID is the resolver for the DeleteTLEById field.
func (r *mutationResolver) DeleteTLEByID(ctx context.Context, id int64) (bool, error) {
	var tleModel table.SatelliteTLE
	err := r.Database.
		Table(tleModel.GetName()).
		Where("id = ?", id).
		Delete(tleModel).
		Error
	if err != nil {
		logger.GetLogger(r.DeleteTLEByID).Warn(err)
		return false, err
	}

	return true, nil
}

// UpdateTLEByID is the resolver for the UpdateTLEById field.
func (r *mutationResolver) UpdateTLEByID(ctx context.Context, id int64, tleData string) (bool, error) {
	var (
		tleModel  table.SatelliteTLE
		tleRecord table.SatelliteTLE
	)

	// Check TLE record existence
	err := r.Database.
		Table(tleModel.GetName()).
		Where("id = ?", id).
		First(&tleRecord).
		Error
	if err != nil {
		logger.GetLogger(r.UpdateTLEByID).Warn(err)
		return false, err
	}
	if len(tleRecord.Line_1) == 0 || len(tleRecord.Line_2) == 0 {
		err = errors.New("no matching TLE record found")
		logger.GetLogger(r.UpdateTLEByID).Warn(err)
		return false, err
	}

	// Load input TLE data, compare IDs
	var (
		inputTLE       tle.TLE
		mockObserver   tle.Observer
		inputSatellite tle.Satellite
	)
	err = inputTLE.Load(tleData)
	if err != nil {
		return false, err
	} else if inputTLE.ID != int64(id) {
		err = errors.New("input TLE ID mismatch the record ID")
		logger.GetLogger(r.UpdateTLEByID).Warn(err)
		return false, err
	}

	// Get current time from GNSS
	var currentTime time.Time
	err = r.Dependency.Invoke(func(deps *gnss.GnssDependency) error {
		t, err := deps.State.Time.GetTime()
		if err != nil {
			return err
		}
		currentTime = t
		return nil
	})
	if err != nil {
		logger.GetLogger(r.UpdateTLEByID).Warn(err)
		return false, err
	}

	// Parse input TLE data
	err = inputSatellite.Parse(&inputTLE, &mockObserver, currentTime)
	if err != nil {
		logger.GetLogger(r.UpdateTLEByID).Warn(err)
		return false, err
	}

	tleRecord.Name = inputTLE.Name
	tleRecord.Line_1 = inputTLE.Line_1
	tleRecord.Line_2 = inputTLE.Line_2
	tleRecord.EpochTime = inputSatellite.EpochTime.UnixMilli()
	tleRecord.Geostationary = inputSatellite.Geostationary

	// Update TLE record
	err = r.Database.
		Table(tleModel.GetName()).
		Where("id = ?", id).
		Updates(tleRecord).
		Error
	if err != nil {
		logger.GetLogger(r.UpdateTLEByID).Warn(err)
		return false, err
	}

	return true, nil
}

// RebootSystem is the resolver for the RebootSystem field.
func (r *mutationResolver) RebootSystem(ctx context.Context) (bool, error) {
	// Reboot system after 3 seconds
	go func() {
		time.Sleep(3 * time.Second)
		system.Reboot()
	}()

	return true, nil
}

// PurgeTaskQueue is the resolver for the PurgeTaskQueue field.
func (r *mutationResolver) PurgeTaskQueue(ctx context.Context) (bool, error) {
	var taskModel table.TaskQueue
	err := r.Database.Table(taskModel.GetName()).
		Select("*").
		Where("id = id").
		Delete(&taskModel).
		Error
	if err != nil {
		logger.GetLogger(r.PurgeTaskQueue).Warn(err)
		return false, err
	}

	return true, nil
}

// PurgeTLERecords is the resolver for the PurgeTLERecords field.
func (r *mutationResolver) PurgeTLERecords(ctx context.Context) (bool, error) {
	var tleModel table.SatelliteTLE
	err := r.Database.Table(tleModel.GetName()).
		Select("*").
		Where("id = id").
		Delete(&tleModel).
		Error
	if err != nil {
		logger.GetLogger(r.PurgeTLERecords).Warn(err)
		return false, err
	}

	return true, nil
}

// PurgeForecastRecords is the resolver for the PurgeForecastRecords field.
func (r *mutationResolver) PurgeForecastRecords(ctx context.Context) (bool, error) {
	var forecastModel table.TransitForecast

	// Clean all forecast records
	err := r.Database.Transaction(func(tx *gorm.DB) error {
		err := tx.
			Table(forecastModel.GetName()).
			Select("*").
			Where("id = id").
			Delete(forecastModel).
			Error
		if err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		logger.GetLogger(r.PurgeForecastRecords).Warn(err)
		return false, err
	}

	return true, nil
}

// GetStation is the resolver for the GetStation field.
func (r *queryResolver) GetStation(ctx context.Context) (*model.Station, error) {
	// Get current time from GNSS
	var currentTime time.Time
	err := r.Dependency.Invoke(func(deps *gnss.GnssDependency) error {
		t, err := deps.State.Time.GetTime()
		if err != nil {
			return err
		}

		currentTime = t
		return nil
	})
	if err != nil {
		logger.GetLogger(r.GetStation).Warn(err)
		return nil, err
	}

	// Get satellite count from database
	var (
		tleModel       table.SatelliteTLE
		satelliteCount int64
	)
	err = r.Database.
		Table(tleModel.GetName()).
		Count(&satelliteCount).
		Error
	if err != nil {
		logger.GetLogger(r.GetStation).Warn(err)
		return nil, err
	}

	// Get task queue count from database
	var (
		taskModel        table.TaskQueue
		pendingTaskCount int64
		totalTaskCount   int64
	)
	err = r.Database.
		Table(taskModel.GetName()).
		Count(&totalTaskCount).
		Where("start_time > ?", currentTime.UnixMilli()).
		Count(&pendingTaskCount).
		Error
	if err != nil {
		logger.GetLogger(r.GetStation).Warn(err)
		return nil, err
	}

	// Get forecast count from database
	var (
		forecastModel      table.TransitForecast
		totalForecastCount int64
	)
	err = r.Database.
		Table(forecastModel.GetName()).
		Count(&totalForecastCount).
		Error
	if err != nil {
		logger.GetLogger(r.GetStation).Warn(err)
		return nil, err
	}

	return &model.Station{
		PendingTasks:  pendingTaskCount,
		TotalTasks:    totalTaskCount,
		TotalForecast: totalForecastCount,
		Satellites:    satelliteCount,
		Name:          r.Config.Station.Name,
		Location:      r.Config.Station.Location,
		Remarks:       r.Config.Station.Remarks,
		ClockOffset:   int(time.Now().UTC().Sub(currentTime).Seconds()),
	}, nil
}

// GetPanTilt is the resolver for the GetPanTilt field.
func (r *queryResolver) GetPanTilt(ctx context.Context) (*model.PanTilt, error) {
	var (
		currentPan  float64
		currentTilt float64
		northOffset float64
		isBusy      bool
	)
	err := r.Dependency.Invoke(func(deps *pan_tilt.PanTiltDependency) error {
		currentPan = deps.CurrentPan
		currentTilt = deps.CurrentTilt
		northOffset = deps.NorthOffset
		isBusy = deps.IsBusy
		return nil
	})
	if err != nil {
		logger.GetLogger(r.GetPanTilt).Warn(err)
		return nil, err
	}

	return &model.PanTilt{
		CurrentPan:  currentPan,
		CurrentTilt: currentTilt,
		NorthOffset: northOffset,
		IsBusy:      isBusy,
	}, nil
}

// GetSystem is the resolver for the GetSystem field.
func (r *queryResolver) GetSystem(ctx context.Context) (*model.System, error) {
	uptime, err := system.GetUptime()
	if err != nil {
		logger.GetLogger(r.GetSystem).Warn(err)
		return nil, err
	}

	cpuUsage, err := system.GetCPUUsage()
	if err != nil {
		logger.GetLogger(r.GetSystem).Warn(err)
		return nil, err
	}

	memUsage, err := system.GetMemUsage()
	if err != nil {
		logger.GetLogger(r.GetSystem).Warn(err)
		return nil, err
	}

	diskUsage, err := system.GetDiskUsage()
	if err != nil {
		logger.GetLogger(r.GetSystem).Warn(err)
		return nil, err
	}

	release, err := system.GetRelease()
	if err != nil {
		logger.GetLogger(r.GetSystem).Warn(err)
		return nil, err
	}

	arch, err := system.GetArch()
	if err != nil {
		logger.GetLogger(r.GetSystem).Warn(err)
		return nil, err
	}

	hostname, err := system.GetHostname()
	if err != nil {
		logger.GetLogger(r.GetSystem).Warn(err)
		return nil, err
	}

	ipAddrs, err := system.GetIPv4Addrs()
	if err != nil {
		logger.GetLogger(r.GetSystem).Warn(err)
		return nil, err
	}

	return &model.System{
		Uptime:    uptime,
		CPUUsage:  cpuUsage,
		MemUsage:  memUsage,
		DiskUsage: diskUsage,
		Release:   release,
		Arch:      arch,
		Hostname:  hostname,
		IP:        ipAddrs,
		Timestamp: time.Now().UTC().UnixMilli(),
	}, nil
}

// GetGnss is the resolver for the getGnss field.
func (r *queryResolver) GetGnss(ctx context.Context, acquire bool) (*model.Gnss, error) {
	var (
		timestamp   int64
		latitude    float64
		longitude   float64
		elevation   float64
		trueAzimuth float64
		dataQuality int
		satellites  int
	)
	err := r.Dependency.Invoke(func(deps *gnss.GnssDependency) error {
		if acquire {
			driver := gnss.GnssDriver(&gnss.GnssDriverImpl{})
			err := driver.GetState(deps)
			if err != nil {
				return err
			}
		}

		t, err := deps.State.Time.GetTime()
		if err != nil {
			return err
		}

		timestamp = t.UnixMilli()
		latitude = deps.State.Latitude
		longitude = deps.State.Longitude
		elevation = deps.State.Elevation
		trueAzimuth = deps.State.TrueAzimuth
		dataQuality = deps.State.DataQuality
		satellites = deps.State.Satellites

		return nil
	})
	if err != nil {
		logger.GetLogger(r.GetGnss).Warn(err)
		return nil, err
	}

	return &model.Gnss{
		Timestamp:   timestamp,
		Latitude:    latitude,
		Longitude:   longitude,
		Elevation:   elevation,
		TrueAzimuth: trueAzimuth,
		DataQuality: dataQuality,
		Satellites:  satellites,
	}, nil
}

// GetAllTLEIds is the resolver for the getAllTLEIds field.
func (r *queryResolver) GetAllTLEIds(ctx context.Context) ([]*int64, error) {
	var tleId []*int64
	var tleModel table.SatelliteTLE
	err := r.Database.
		Table(tleModel.GetName()).
		Pluck("id", &tleId).
		Error
	if err != nil {
		logger.GetLogger(r.GetAllTLEIds).Warn(err)
		return nil, err
	}

	return tleId, nil
}

// GetTLEByID is the resolver for the GetTLEById field.
func (r *queryResolver) GetTLEByID(ctx context.Context, id int64) (*model.TleData, error) {
	var (
		tleModel  table.SatelliteTLE
		tleRecord table.SatelliteTLE
	)

	// Check TLE record existence
	err := r.Database.
		Table(tleModel.GetName()).
		Where("id = ?", id).
		First(&tleRecord).
		Error
	if err != nil {
		logger.GetLogger(r.GetTLEByID).Warn(err)
		return nil, err
	}
	if len(tleRecord.Line_1) == 0 || len(tleRecord.Line_2) == 0 {
		err = errors.New("no matching TLE record found")
		logger.GetLogger(r.GetTLEByID).Warn(err)
		return nil, err
	}

	return &model.TleData{
		ID:        tleRecord.ID,
		Name:      tleRecord.Name,
		Line1:     tleRecord.Line_1,
		Line2:     tleRecord.Line_2,
		EpochTime: tleRecord.EpochTime,
	}, nil
}

// Mutation returns MutationResolver implementation.
func (r *Resolver) Mutation() MutationResolver { return &mutationResolver{r} }

// Query returns QueryResolver implementation.
func (r *Resolver) Query() QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
