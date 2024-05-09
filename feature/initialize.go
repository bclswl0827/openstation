package feature

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
		Altitude:  0,
	}
	s.Compass = &compass{
		IsReady:       false,
		HasCalibrated: false,
		Azimuth:       0,
		Declination:   0,
	}
	s.PanTilt = &panTilt{
		IsReady:      false,
		IsBusy:       false,
		HasFindNorth: false,
		PanAngle:     0,
		TiltAngle:    0,
	}
	s.Monitor = &monitor{
		IsReady: false,
	}
	s.PendingTasks = 0
	s.Satellites = 0
}
