package feature

import (
	"sync"

	"github.com/bclswl0827/openstation/config"
	"github.com/bclswl0827/openstation/publisher"
	"gorm.io/gorm"
)

type Feature interface {
	Run(*FeatureOptions, *sync.WaitGroup)
	OnStart(*FeatureOptions, ...any)
	OnStop(*FeatureOptions, ...any)
	OnReady(*FeatureOptions, ...any)
	OnError(*FeatureOptions, error)
}

type FeatureOptions struct {
	Database *gorm.DB
	Config   *config.Config
	Status   *publisher.Status
}
