package dao

import (
	"gorm.io/gorm"
)

func Update[T any](dbObj *gorm.DB, tableImpl ITable[T], query any, args ...any) error {
	return dbObj.
		Model(tableImpl.GetModel()).
		Where(query, args...).
		Updates(tableImpl.GetData()).
		Error
}
