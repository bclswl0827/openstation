package duration

import "time"

func Diff(current, target time.Time) time.Duration {
	return current.Sub(target)
}
