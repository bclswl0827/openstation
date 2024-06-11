package main

type arguments struct {
	pantiltDevice   string
	pantiltBaudrate int
	pan             float64
	tilt            float64
	reset           bool
	init            bool
	offset          float64
}
