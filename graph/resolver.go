package graph

import (
	"github.com/bclswl0827/openstation/config"
	"go.uber.org/dig"
	"gorm.io/gorm"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	Config     *config.Config
	Dependency *dig.Container
	Database   *gorm.DB
}
