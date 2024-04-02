package dao

import (
	"fmt"
	"time"

	"gorm.io/gorm"
)

func Open(host string, port int, engineName, username, password, database string, timeout time.Duration) (*gorm.DB, error) {
	engines := []engine{
		&PostgreSQL{},
		&MariaDB{},
		&SQLServer{},
		&SQLite{},
	}
	for _, e := range engines {
		if e.compatible(engineName) {
			return e.open(host, port, username, password, database, timeout)
		}
	}

	err := fmt.Errorf("database engine %s is unsupported", engineName)
	return nil, err
}
