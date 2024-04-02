package dao

import "gorm.io/gorm"

func Delete[T any](dbObj *gorm.DB, tableImpl ITable[T], query any, args ...any) error {
	return dbObj.
		Table(tableImpl.GetName()).
		Where(query, args...).
		Delete(tableImpl.GetModel()).
		Error
}
