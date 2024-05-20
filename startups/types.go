package startups

import (
	"github.com/bclswl0827/openstation/config"
	"go.uber.org/dig"
	"gorm.io/gorm"
)

type Options struct {
	Config   *config.Config
	Database *gorm.DB
}

type StartupTask interface {
	Provide(*dig.Container, *Options) error
	Execute(*dig.Container, *Options) error
	GetTaskName() string
}
