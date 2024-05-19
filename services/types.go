package services

import (
	"os"

	"github.com/bclswl0827/openstation/config"
	"go.uber.org/dig"
	"gorm.io/gorm"
)

type Options struct {
	Config     *config.Config
	Dependency *dig.Container
	Database   *gorm.DB
	OsSignal   chan os.Signal
}

type Service interface {
	Start(*Options)
	Stop(*Options)
	OnStart(*Options)
	OnStop(*Options)
	OnError(error, bool, *Options)
}
