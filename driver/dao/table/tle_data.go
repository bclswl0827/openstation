package table

import "github.com/bclswl0827/openstation/driver/dao"

type TLEData struct {
	dao.BaseModel
	LastUpdate int64  `gorm:"last_update;index;not null"`
	Satellite  string `gorm:"satellite;type:text;not null"`
	Oribital   string `gorm:"orbital;type:text;not null"`
}

func (t TLEData) GetModel() TLEData {
	return TLEData{}
}

func (t TLEData) GetData() TLEData {
	return t
}

func (t TLEData) GetName() string {
	return "tle_data"
}
