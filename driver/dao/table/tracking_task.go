package table

import "github.com/bclswl0827/openstation/driver/dao"

type TraceTask struct {
	dao.BaseModel
	LastUpdate int64  `gorm:"last_update;index;not null"`
	Satellite  string `gorm:"satellite;type:text;not null"`
	Oribital   string `gorm:"orbital;type:text;not null"`
}

func (t TraceTask) GetModel() TraceTask {
	return TraceTask{}
}

func (t TraceTask) GetData() TraceTask {
	return t
}

func (t TraceTask) GetName() string {
	return "tle_data"
}
