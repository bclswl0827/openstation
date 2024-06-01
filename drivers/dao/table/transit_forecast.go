package table

import (
	"github.com/bclswl0827/openstation/drivers/dao"
)

type TransitForecast struct {
	dao.BaseModel
	ID           int64   `gorm:"column:id;not null;index"`
	Name         string  `gorm:"column:name;not null;index"`
	Latitude     float64 `gorm:"column:latitude;not null"`
	Longitude    float64 `gorm:"column:longitude;not null"`
	EntryAzimuth float64 `gorm:"column:entry_azimuth;not null"`
	MaxElevation float64 `gorm:"column:max_elevation;not null;index"`
	StartTime    int64   `gorm:"column:start_time;not null;index;unique"`
	EndTime      int64   `gorm:"column:end_time;not null;index;unique"`
	EpochTime    int64   `gorm:"column:epoch_time;not null;index"`
	CreatedAt    int64   `gorm:"column:created_at;not null;index"`
}

func (t TransitForecast) GetModel() TransitForecast {
	return TransitForecast{}
}

func (t TransitForecast) GetName() string {
	return "transit_forecast"
}
