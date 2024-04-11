package feature

import (
	"sync"
	"time"

	"github.com/bclswl0827/openstation/config"
	"gorm.io/gorm"
)

type Status struct {
	IsReady  bool
	GnssTime time.Time
}

type Options struct {
	Database *gorm.DB
	Status   *Status
	Config   *config.Config
}

type Feature interface {
	Run(*Options, *sync.WaitGroup)
	OnError(*Options, error, ...any)
	OnMessage(*Options, string, ...any)
}
