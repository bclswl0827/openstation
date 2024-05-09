package feature

import (
	"sync"
	"time"

	"github.com/bclswl0827/openstation/config"
	messagebus "github.com/vardius/message-bus"
	"gorm.io/gorm"
)

type rtcTime struct {
	IsReady    bool
	IsValid    bool
	TimeOffset time.Duration
}

type gnss struct {
	IsReady   bool
	IsValid   bool
	Latitude  float64
	Longitude float64
	Altitude  float64
}

type compass struct {
	IsReady       bool
	HasCalibrated bool
	Azimuth       float64
	Declination   float64
}

type panTilt struct {
	IsReady      bool
	IsBusy       bool
	HasFindNorth bool
	PanAngle     float64
	TiltAngle    float64
}

type monitor struct {
	IsReady bool
}

type State struct {
	PendingTasks int
	Satellites   int
	Monitor      *monitor
	Compass      *compass
	PanTilt      *panTilt
	RTCTime      *rtcTime
	GNSS         *gnss
}

type Options struct {
	State      *State
	Database   *gorm.DB
	Config     *config.Config
	MessageBus messagebus.MessageBus
}

type Feature interface {
	Terminate(*Options, *sync.WaitGroup)
	Start(*Options, *sync.WaitGroup)
	OnEvent(*Options, string, ...any)
	OnError(*Options, error, bool)
	OnStart(*Options)
	OnStop(*Options)
}
