package dao

import (
	"time"

	"gorm.io/gorm"
)

type engine interface {
	compatible(engine string) bool
	open(host string, port int, username, password, database string, timeout time.Duration) (*gorm.DB, error)
}

type BaseModel struct {
	// This field is the primary key of the table
	PrimaryKey uint64 `gorm:"primarykey"`
}

type ITable[T any] interface {
	GetModel() T
	GetData() T
	GetName() string
}
