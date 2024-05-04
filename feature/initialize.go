package feature

func (s *States) Initialize() {
	s.IsPanTiltReady = false
	s.IsMonitorReady = false
	s.IsGNSSReady = false
	s.IsIMUReady = false
	s.IsRTCReady = false
	s.HasFindNorth = false
	s.PendingTasks = 0
	s.Satellites = 0
	s.TimeOffset = 0
}
