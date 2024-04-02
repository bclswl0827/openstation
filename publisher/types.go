package publisher

import "time"

type System struct {
	Offset float64 `json:"offset"`
}

type Status struct {
	ReadyTime time.Time // If is zero, app will stuck to wait for time syncing
	System    *System
}
