package dao

import (
	"fmt"
	"time"

	"github.com/glebarez/sqlite"
	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlserver"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type PostgreSQL struct{}

func (p *PostgreSQL) compatible(engine string) bool {
	return engine == "postgres" || engine == "postgresql"
}

func (p *PostgreSQL) open(host string, port int, username, password, database string, timeout time.Duration) (*gorm.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=disable connect_timeout=%d TimeZone=Etc/GMT",
		host, port, username, password, database, int(timeout.Seconds()),
	)
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger:                 logger.Default.LogMode(logger.Silent),
		SkipDefaultTransaction: true, // Disable transaction to improve performance
	})
	if err != nil {
		return nil, err
	}
	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}
	sqlDB.SetConnMaxLifetime(timeout)
	return db, nil
}

type MariaDB struct{}

func (m *MariaDB) compatible(engine string) bool {
	return engine == "mysql" || engine == "mariadb"
}

func (m *MariaDB) open(host string, port int, username, password, database string, timeout time.Duration) (*gorm.DB, error) {
	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&timeout=%ds&loc=UTC",
		username, password, host, port, database, int(timeout.Seconds()),
	)
	return gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger:                 logger.Default.LogMode(logger.Silent),
		SkipDefaultTransaction: true, // Disable transaction to improve performance
	})
}

type SQLServer struct{}

func (s *SQLServer) compatible(engine string) bool {
	return engine == "sqlserver" || engine == "mssql"
}

func (s *SQLServer) open(host string, port int, username, password, database string, timeout time.Duration) (*gorm.DB, error) {
	dsn := fmt.Sprintf(
		"sqlserver://%s:%s@%s:%d?database=%s",
		username, password, host, port, database,
	)
	return gorm.Open(sqlserver.Open(dsn), &gorm.Config{
		Logger:                 logger.Default.LogMode(logger.Silent),
		SkipDefaultTransaction: true, // Disable transaction to improve performance
	})
}

type SQLite struct{}

func (s *SQLite) compatible(engine string) bool {
	return engine == "sqlite3" || engine == "sqlite"
}

func (s *SQLite) open(host string, port int, username, password, database string, timeout time.Duration) (*gorm.DB, error) {
	dsn := fmt.Sprintf("file://%s?cache=shared&mode=rwc&_pragma=busy_timeout(%d)", database, int(timeout.Seconds()))
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	sqlDB, _ := db.DB()
	sqlDB.SetMaxOpenConns(1)

	return db, err
}
