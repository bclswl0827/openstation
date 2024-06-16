package tle

import "time"

type TLE struct {
	ID     int64
	Name   string
	Line_1 string
	Line_2 string
}

type Observer struct {
	Elevation float64
	Latitude  float64
	Longitude float64
}

type Transit struct {
	StartTime    time.Time
	EndTime      time.Time
	MaxElevation float64
	EntryAzimuth float64
	ExitAzimuth  float64
}

type Bootstrap struct {
	Timestamp int64   `json:"time"`
	Azimuth   float64 `json:"azimuth"`
	Elevation float64 `json:"elevation"`
}

type Satellite struct {
	EpochTime     time.Time
	Latitude      float64
	Longitude     float64
	Range         float64
	Azimuth       float64
	Elevation     float64
	Poloarization float64
	Observable    bool
	Geostationary bool
}
