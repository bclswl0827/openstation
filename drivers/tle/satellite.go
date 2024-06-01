package tle

import (
	"errors"
	"math"
	"strconv"
	"time"

	"github.com/joshuaferrara/go-satellite"
)

func (s *Satellite) getEpoch(tle *TLE) (time.Time, error) {
	if len(tle.Line_1) < 32 {
		return time.Time{}, errors.New("invalid TLE data")
	}

	yearPart := tle.Line_1[18:20]
	dayOfYearPart := tle.Line_1[20:32]

	year, err := strconv.Atoi("20" + yearPart)
	if err != nil {
		return time.Time{}, err
	}

	dayOfYear, err := strconv.ParseFloat(dayOfYearPart, 64)
	if err != nil {
		return time.Time{}, err
	}

	baseTime := time.Date(year, time.January, 0, 0, 0, 0, 0, time.UTC)
	secondsToAdd := int((dayOfYear - float64(int(dayOfYear))) * 86400)
	finalTime := baseTime.AddDate(0, 0, int(dayOfYear)-1).Add(time.Second * time.Duration(secondsToAdd))

	return finalTime, nil
}

func (s *Satellite) Parse(tle *TLE, observer *Observer, observeTime time.Time) error {
	var (
		yr, mo, da   = observeTime.Date()
		hr, min, sec = observeTime.Clock()
	)
	position, _ := satellite.Propagate(
		satellite.TLEToSat(tle.Line_1, tle.Line_2, "wgs84"),
		yr, int(mo), da, hr, min, sec,
	)
	_, _, coordinate := satellite.ECIToLLA(
		position, satellite.GSTimeFromDate(
			yr, int(mo), da, hr, min, sec,
		),
	)

	location := satellite.LatLong{
		Latitude:  observer.Latitude * math.Pi / 180,
		Longitude: observer.Longitude * math.Pi / 180,
	}
	lookAngles := satellite.ECIToLookAngles(
		position, location, observer.Altitude,
		satellite.JDay(yr, int(mo), da, hr, min, sec),
	)
	polarization := math.Tan(
		math.Sin(location.Longitude-coordinate.Longitude) /
			math.Tan(location.Latitude),
	)
	if math.IsNaN(polarization) {
		polarization = 0
	}

	longitude := 360 + coordinate.Longitude*180/math.Pi
	if longitude > 360 {
		longitude = longitude - 360
	} else if longitude < -360 {
		longitude = longitude + 360
	}

	epochTime, err := s.getEpoch(tle)
	if err != nil {
		return err
	}

	s.EpochTime = epochTime
	s.Latitude = coordinate.Latitude * 180 / math.Pi
	s.Longitude = longitude
	s.Azimuth = lookAngles.Az * 180 / math.Pi
	s.Elevation = lookAngles.El * 180 / math.Pi
	s.Range = lookAngles.Rg
	s.Poloarization = polarization
	s.Geostationary = lookAngles.Rg > 42164

	if s.Elevation*180/math.Pi > 3 {
		s.Observable = true
	} else {
		s.Observable = false
	}

	return nil
}

// Predict calculates the transits of a satellite over an observer between startTime and endTime.
func (s *Satellite) Predict(tle *TLE, observer *Observer, startTime, endTime time.Time, step time.Duration) ([]Transit, error) {
	var (
		transits       []Transit
		currentTransit *Transit
	)
	for t := startTime; t.Before(endTime); t = t.Add(step) {
		var sat Satellite
		err := sat.Parse(tle, observer, t)
		if err != nil {
			return nil, err
		}

		// Check if satellite becomes observable
		if sat.Observable {
			if currentTransit == nil {
				// Start of a new transit
				currentTransit = &Transit{
					StartTime:    t,
					MaxElevation: sat.Elevation,
					EntryAzimuth: sat.Azimuth,
				}
			} else {
				// Update the maximum elevation
				if sat.Elevation > currentTransit.MaxElevation {
					currentTransit.MaxElevation = sat.Elevation
				}
			}
		} else if currentTransit != nil {
			// End of current transit
			currentTransit.EndTime = t
			transits = append(transits, *currentTransit)
			currentTransit = nil
		}
	}

	// Check if the last transit extends to the end time
	if currentTransit != nil {
		currentTransit.EndTime = endTime
		transits = append(transits, *currentTransit)
	}

	return transits, nil
}
