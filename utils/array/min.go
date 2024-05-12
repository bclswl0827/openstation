package array

import "golang.org/x/exp/constraints"

func Min[T constraints.Ordered](s []T) (T, int) {
	if len(s) == 0 {
		var zero T
		return zero, -1
	}

	m := s[0]
	for i, v := range s {
		if m > v {
			return v, i
		}
	}

	return m, 0
}
