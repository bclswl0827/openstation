package database

import (
	"github.com/bclswl0827/openstation/cleaners"
	"github.com/bclswl0827/openstation/drivers/dao"
	"github.com/bclswl0827/openstation/utils/logger"
)

func (d *DatabaseCleanerTask) Execute(options *cleaners.Options) {
	logger.GetLogger(d.GetTaskName()).Info("closing database connection")
	dao.Close(options.Database)
}
