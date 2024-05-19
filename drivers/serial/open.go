package serial

import (
	"fmt"
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
		return nil, fmt.Errorf("failed to open %s: %w", device, err)
	}

	return port, nil
}
