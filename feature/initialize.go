package feature

func (s *State) Initialize() {
	s.IsMonitorReady = false
	s.PendingTasks = 0
	s.Satellites = 0
	s.RTCTime = &rtcTime{
		IsRTCValid: false,
		TimeOffset: 0,
	}
	s.GNSS = &gnss{
		IsGNSSValid: false,
		Latitude:    0,
		Longitude:   0,
		Altitude:    0,
	}
	s.PanTilt = &panTilt{
		IsPanTiltMoving: false,
		IsPanTiltReady:  false,
		IsCompassReady:  false,
		HasFindNorth:    false,
		Azimuth:         0,
		PanAngle:        0,
		TiltAngle:       0,
	}
	s.PendingTasks = 0
	s.Satellites = 0
}
