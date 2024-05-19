package database

import (
	"github.com/bclswl0827/openstation/cleaners"
	"github.com/bclswl0827/openstation/drivers/dao"
)

func (d *DatabaseCleanerTask) Execute(options *cleaners.Options) {
	dao.Close(options.Database)
}
