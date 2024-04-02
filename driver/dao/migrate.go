package dao

import (
	"gorm.io/gorm"
)

func Migrate[T any](dbObj *gorm.DB, tableImpl ITable[T]) error {
	tableRecord := tableImpl.GetData()
	return dbObj.Table(tableImpl.GetName()).AutoMigrate(&tableRecord)
}
