package tables

import "github.com/bclswl0827/openstation/drivers/dao"

type TaskQueue struct {
	dao.BaseModel
	ID        int64  `gorm:"column:id;not null;index;unique"`
	Name      string `gorm:"column:name;not null;index"`
	StartTime int64  `gorm:"column:start_time;not null;index"`
	EndTime   int64  `gorm:"column:end_time;not null;index"`
	HasDone   bool   `gorm:"column:has_done;not null;index"`
	Bootstrap string `gorm:"column:bootstrap;not null"`
}

func (t TaskQueue) GetModel() TaskQueue {
	return TaskQueue{}
}

func (t TaskQueue) GetName() string {
	return "task_queue"
}
