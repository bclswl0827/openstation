package feature

import (
	"sync"

	"github.com/bclswl0827/openstation/config"
	messagebus "github.com/vardius/message-bus"
	"gorm.io/gorm"
)

type rtcTime struct {
	IsRTCValid bool
	TimeOffset float64
}

type gnss struct {
	IsGNSSValid bool
	Latitude    float64
	Longitude   float64
	Altitude    float64
}

type panTilt struct {
	IsPanTiltMoving bool
	IsPanTiltReady  bool
	IsCompassReady  bool
	HasFindNorth    bool
	Azimuth         float64
	PanAngle        float64
	TiltAngle       float64
}

type State struct {
	IsMonitorReady bool
	PendingTasks   int
	Satellites     int
	PanTilt        *panTilt
	RTCTime        *rtcTime
	GNSS           *gnss
}

type Options struct {
	State      *State
	Database   *gorm.DB
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
