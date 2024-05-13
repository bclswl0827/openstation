package features

import "os"

func (s *State) Initialize() {
	s.RTCTime = &rtcTime{
		IsReady:    false,
		IsValid:    false,
		TimeOffset: 0,
	}
	s.GNSS = &gnss{
		IsReady:   false,
		IsValid:   false,
		Latitude:  0,
		Longitude: 0,
	}
	s.Compass = &compass{
		IsReady:       false,
		HasCalibrated: false,
		MagAzimuth:    0,
		Declination:   0,
	}
	s.PanTilt = &panTilt{
		IsReady:      false,
		IsBusy:       false,
		HasFindNorth: false,
		PanOffset:    0,
	}
	s.Monitor = &monitor{
		IsReady: false,
		IsBusy:  false,
	}
	s.SigCh = make(chan os.Signal, 1)
	s.PendingTasks = 0
	s.Satellites = 0
}
