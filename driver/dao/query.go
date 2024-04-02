package dao

import (
	"gorm.io/gorm"
)

func Query[T any](dbObj *gorm.DB, tableImpl ITable[T], query any, args ...any) ([]T, error) {
	var result []T
	err := dbObj.
		Table(tableImpl.GetName()).
		Where(query, args...).
		Find(&result).
		Error
	return result, err
}
