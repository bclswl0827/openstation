package feature

import (
	"sync"

	"github.com/bclswl0827/openstation/config"
	messagebus "github.com/vardius/message-bus"
	"gorm.io/gorm"
)

type States struct {
	IsPanTiltReady bool
	IsMonitorReady bool
	IsGNSSReady    bool
	IsIMUReady     bool
	IsRTCReady     bool
	HasFindNorth   bool
	PendingTasks   int
	Satellites     int
	TimeOffset     float64
}

type Options struct {
	Database   *gorm.DB
	States     *States
	Config     *config.Config
	MessageBus messagebus.MessageBus
}

type Feature interface {
	Run(*Options, *sync.WaitGroup)
	OnEvent(*Options, string, ...any)
	OnError(*Options, error, bool)
	OnStart(*Options)
	OnStop(*Options)
}
