package main

type arguments struct {
	pantiltDevice   string
	pantiltBaudrate int
	pan             float64
	tilt            float64
	reset           bool
	zero            bool
	wait            bool
	offset          float64
}