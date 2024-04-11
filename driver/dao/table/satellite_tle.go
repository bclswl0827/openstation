package table

import "github.com/bclswl0827/openstation/driver/dao"

type SatelliteTLE struct {
	dao.BaseModel
	LastUpdate int64  `gorm:"last_update;index;not null"`
	Satellite  string `gorm:"satellite;type:text;not null"`
	Oribital   string `gorm:"orbital;type:text;not null"`
}

func (t SatelliteTLE) GetModel() SatelliteTLE {
	return SatelliteTLE{}
}

func (t SatelliteTLE) GetData() SatelliteTLE {
	return t
}

func (t SatelliteTLE) GetName() string {
	return "tle_data"
}
