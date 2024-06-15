package tables

import "github.com/bclswl0827/openstation/drivers/dao"

type TaskQueue struct {
	dao.BaseModel
	TaskID    string `gorm:"column:task_id;not null;index"`
	TLEID     string `gorm:"column:tle_id;not null;index"`
	Name      string `gorm:"column:name;not null;index"`
	StartTime int64  `gorm:"column:start_time;not null;index"`
	EndTime   int64  `gorm:"column:end_time;not null;index"`
	HasDone   bool   `gorm:"column:has_done;not null;index"`
	WebHook   string `gorm:"column:webhook;not null"`
	Bootstrap string `gorm:"column:bootstrap;not null"`
}

func (t TaskQueue) GetModel() TaskQueue {
	return TaskQueue{}
}

func (t TaskQueue) GetName() string {
	return "task_queue"
}
