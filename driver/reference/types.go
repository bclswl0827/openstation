package reference

import "io"

type ReferenceSourcePacket struct {
	Data     [3]int32
	Checksum uint8
}

type ReferenceSourceDriver interface {
	// Initializes the magnetometer device
	Init(io.ReadWriteCloser) error
	// Resets the magnetometer
	Reset(io.ReadWriteCloser) error
	// Gets the azimuth from the magnetometer
	GetAzimuth(io.ReadWriteCloser, float64) (float64, error)
}
