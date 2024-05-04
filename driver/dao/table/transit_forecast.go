package table

import "github.com/bclswl0827/openstation/driver/dao"

type TransitForcast struct {
	dao.BaseModel
	ID           int64   `gorm:"column:id;not null;index"`
	Name         string  `gorm:"column:name;type:text;not null;index"`
	Latitude     float64 `gorm:"column:latitude;not null"`
	Longitude    float64 `gorm:"column:longitude;not null"`
	Altitude     float64 `gorm:"column:altitude;not null"`
	MaxElevation float64 `gorm:"column:max_elevation;not null;index"`
	Timestamp    int64   `gorm:"column:timestamp;not null;index"`
	LastUpdate   int64   `gorm:"column:last_update;not null;index"`
}

func (t TransitForcast) GetModel() TransitForcast {
	return TransitForcast{}
}

func (t TransitForcast) GetName() string {
	return "transit_forecast"
}
