package gnss

import (
	"errors"
	"time"
)

func (g *GnssTime) GetTime() (time.Time, error) {
	if g.BaseTime.IsZero() {
		return g.RefTime, errors.New("empty BaseTime is not allowed")
	}

	elapsed := time.Since(g.BaseTime)
	return g.RefTime.Add(elapsed), nil
}
