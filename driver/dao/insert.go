package dao

import "gorm.io/gorm"

func Insert[T any](dbObj *gorm.DB, tableImpl ITable[T]) error {
	tableData := tableImpl.GetData()
	return dbObj.Table(tableImpl.GetName()).Create(&tableData).Error
}
