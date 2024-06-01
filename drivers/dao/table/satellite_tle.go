package table

import "github.com/bclswl0827/openstation/drivers/dao"

type SatelliteTLE struct {
	dao.BaseModel
	ID            int64  `gorm:"column:id;not null;index;unique"`
	Name          string `gorm:"column:name;not null;index"`
	Line_1        string `gorm:"column:line_1;not null"`
	Line_2        string `gorm:"column:line_2;not null"`
	EpochTime     int64  `gorm:"column:epoch_time;not null;index"`
	CreatedAt     int64  `gorm:"column:created_at;not null;index"`
	UpdatedAt     int64  `gorm:"column:updated_at;not null;index"`
	Geostationary bool   `gorm:"column:geostationary;not null;index"`
}

func (t SatelliteTLE) GetModel() SatelliteTLE {
	return SatelliteTLE{}
}

func (t SatelliteTLE) GetName() string {
	return "satellite_tle"
}
