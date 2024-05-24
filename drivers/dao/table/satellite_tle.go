package table

import "github.com/bclswl0827/openstation/drivers/dao"

type SatelliteTLE struct {
	dao.BaseModel
	ID            int64  `gorm:"column:id;not null;index"`
	Name          string `gorm:"column:name;type:text;not null;index"`
	Line_1        string `gorm:"column:line_1;type:text;not null"`
	Line_2        string `gorm:"column:line_2;type:text;not null"`
	EpochTime     int64  `gorm:"column:epoch;not null;index"`
	LastUpdate    int64  `gorm:"column:last_update;not null;index"`
	Geostationary bool   `gorm:"column:geostationary;not null;index"`
}

func (t SatelliteTLE) GetModel() SatelliteTLE {
	return SatelliteTLE{}
}

func (t SatelliteTLE) GetName() string {
	return "satellite_tle"
}
