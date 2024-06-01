package table

import "github.com/bclswl0827/openstation/drivers/dao"

type TaskQueue struct {
	dao.BaseModel
	ID        int64  `gorm:"column:id;not null;index"`
	Name      string `gorm:"column:name;not null;index"`
	WebHooks  string `gorm:"column:webhooks;not null"`
	StartTime int64  `gorm:"column:start_time;not null;index"`
	EndTime   int64  `gorm:"column:end_time;not null;index"`
	CreatedAt int64  `gorm:"column:created_at;not null;index"`
}

func (t TaskQueue) GetModel() TaskQueue {
	return TaskQueue{}
}

func (t TaskQueue) GetName() string {
	return "task_queue"
}
