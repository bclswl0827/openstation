package serial

import (
	"io"

	"github.com/bclswl0827/go-serial"
)

func Open(device string, baud int) (io.ReadWriteCloser, error) {
	port, err := serial.Open(device,
		serial.WithHUPCL(true),
		serial.WithDataBits(8),
		serial.WithReadTimeout(1),
		serial.WithWriteTimeout(1),
		serial.WithBaudrate(baud),
		serial.WithParity(serial.NoParity),
		serial.WithStopBits(serial.OneStopBit),
	)
	if err != nil {
		return nil, err
	}

	port.SetDTR(true)
	port.SetRTS(true)

	return port, nil
}