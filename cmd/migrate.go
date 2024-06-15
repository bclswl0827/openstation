package main

import (
	"github.com/bclswl0827/openstation/drivers/dao"
	"github.com/bclswl0827/openstation/drivers/dao/tables"
	"gorm.io/gorm"
)

func migrate(databaseConn *gorm.DB) error {
	err := dao.Migrate(databaseConn, tables.TaskQueue{})
	if err != nil {
		return err
	}
	err = dao.Migrate(databaseConn, tables.SatelliteTLE{})
	if err != nil {
		return err
	}

	return nil
}
