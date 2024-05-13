package table

import "github.com/bclswl0827/openstation/drivers/dao"

type PendingTasks struct {
	dao.BaseModel
	ID         int64  `gorm:"column:id;not null;index"`
	Name       string `gorm:"column:name;type:text;not null;index"`
	Remarks    string `gorm:"column:remarks;type:text;not null"`
	StartHooks string `gorm:"column:start_hooks;type:text;not null"`
	EndHooks   string `gorm:"column:end_hooks;type:text;not null"`
	StartTime  int64  `gorm:"column:start_time;not null;index"`
	EndTime    int64  `gorm:"column:end_time;not null;index"`
	CreatedAt  int64  `gorm:"column:created_at;not null;index"`
}

func (t PendingTasks) GetModel() PendingTasks {
	return PendingTasks{}
}

func (t PendingTasks) GetName() string {
	return "pending_tasks"
}
