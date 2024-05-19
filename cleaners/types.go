package cleaners

import (
	"github.com/bclswl0827/openstation/config"
	"go.uber.org/dig"
	"gorm.io/gorm"
)

type Options struct {
	Config     *config.Config
	Database   *gorm.DB
	Dependency *dig.Container
}

type CleanerTask interface {
	Execute(*Options)
	GetTaskName() string
}
