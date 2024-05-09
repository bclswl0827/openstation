package duration

import "time"

func GetOffsetTime(offset time.Duration) (time.Time, int64) {
	currentTime := time.Now().UTC()

	result := currentTime.Add(offset)
	return result, result.UnixMilli()
}
