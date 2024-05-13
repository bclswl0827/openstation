package tle

import "time"

const EXPIRATION_DAYS = time.Duration(24 * 3 * time.Hour)

type TLE struct {
	ID     int64
	Name   string
	Line_1 string
	Line_2 string
}

type Observer struct {
	Time      time.Time
	Altitude  float64
	Latitude  float64
	Longitude float64
}

type Satellite struct {
	Epoch         time.Time
	Latitude      float64
	Longitude     float64
	Range         float64
	Azimuth       float64
	Elevation     float64
	Poloarization float64
	Observable    bool
}
