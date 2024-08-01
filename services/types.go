package services

import (
	"context"
	"sync"

	"github.com/bclswl0827/openstation/config"
	"go.uber.org/dig"
	"gorm.io/gorm"
)

type Options struct {
	MockMode   bool
	Config     *config.Config
	Dependency *dig.Container
	Database   *gorm.DB
	Context    context.Context
}

type Service interface {
	Start(options *Options, waitGroup *sync.WaitGroup)
	GetTaskName() string
}
