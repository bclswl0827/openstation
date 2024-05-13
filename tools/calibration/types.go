package main

type arguments struct {
	pantiltDevice     string
	pantiltBaudrate   int
	referenceDevice   string
	referenceBaudrate int
	csvResultPath     string
}

type magRecord struct {
	x float64
	y float64
	z float64
}
