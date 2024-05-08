package feature

import (
	"sync"

	"github.com/bclswl0827/openstation/config"
	messagebus "github.com/vardius/message-bus"
	"gorm.io/gorm"
)

type States struct {
	IsMonitorReady bool
	PendingTasks   int
	Satellites     int
}

type RTCTime struct {
	IsRTCValid bool
	TimeOffset float64
}

type Coordinates struct {
	IsPanTiltMoving bool
	IsPanTiltReady  bool
	IsGNSSValid     bool
	Latitude        float64
	Longitude       float64
	Altitude        float64
}

type PanTilt struct {
	IsCompassReady bool
	HasFindNorth   bool
	Azimuth        float64
	PanAngle       float64
	TiltAngle      float64
}

type Options struct {
	States      *States
	PanTilt     *PanTilt
	RTCTime     *RTCTime
	Coordinates *Coordinates
	Database    *gorm.DB
	Config      *config.Config
	MessageBus  messagebus.MessageBus
}

type Feature interface {
	Run(*Options, *sync.WaitGroup)
	OnEvent(*Options, string, ...any)
	OnError(*Options, error, bool)
	OnStart(*Options)
	OnStop(*Options)
}
