package dao

import (
	"fmt"

	"gorm.io/gorm"
)

func Open(host string, port int, engineName, username, password, database string) (*gorm.DB, error) {
	engines := []engine{
		&PostgreSQL{},
		&MariaDB{},
		&SQLServer{},
		&SQLite{},
	}
	for _, e := range engines {
		if e.match(engineName) {
			return e.open(host, port, username, password, database, CONNECT_TIMEOUT)
		}
	}

	err := fmt.Errorf("database engine %s is unsupported", engineName)
	return nil, err
}
