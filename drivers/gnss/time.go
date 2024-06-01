package gnss

import (
	"errors"
	"time"
)

func (g *GnssTime) GetTime() (time.Time, error) {
	if g.BaseTime.IsZero() || g.RefTime.IsZero() {
		return time.Time{}, errors.New("empty BaseTime or RefTime is not allowed")
	}

	elapsed := time.Since(g.BaseTime.UTC())
	return g.RefTime.Add(elapsed).UTC(), nil
}
