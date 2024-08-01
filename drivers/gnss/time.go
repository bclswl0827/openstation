package gnss

import (
	"errors"
	"time"
)

func (g *GnssTime) GetTime() (time.Time, error) {
	if g.LocalBaseTime.IsZero() || g.ReferenceTime.IsZero() {
		return time.Time{}, errors.New("empty BaseTime or RefTime is not allowed")
	}

	elapsed := time.Since(g.LocalBaseTime.UTC())
	return g.ReferenceTime.Add(elapsed).UTC(), nil
}
