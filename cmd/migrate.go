package main

import (
	"github.com/bclswl0827/openstation/drivers/dao"
	"github.com/bclswl0827/openstation/drivers/dao/table"
	"gorm.io/gorm"
)

func migrate(databaseConn *gorm.DB) error {
	err := dao.Migrate(databaseConn, table.TaskQueue{})
	if err != nil {
		return err
	}
	err = dao.Migrate(databaseConn, table.SatelliteTLE{})
	if err != nil {
		return err
	}
	err = dao.Migrate(databaseConn, table.TransitForecast{})
	if err != nil {
		return err
	}

	return nil
}
