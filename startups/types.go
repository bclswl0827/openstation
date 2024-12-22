package startups

import (
	"context"

	"github.com/bclswl0827/openstation/config"
	"go.uber.org/dig"
	"gorm.io/gorm"
)

type Options struct {
	MockMode    bool
	Config      *config.Config
	Database    *gorm.DB
	CancelToken context.Context
}

type StartupTask interface {
	Provide(*dig.Container, *Options) error
	Execute(*dig.Container, *Options) error
	GetTaskName() string
}
