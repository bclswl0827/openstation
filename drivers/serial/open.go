package serial

import (
	"fmt"

	"github.com/bclswl0827/go-serial"
)

func Open(device string, baud int) (*serial.Port, error) {
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

	port.SetDTR(true)
	port.SetRTS(true)

	return port, nil
}
