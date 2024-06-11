package serial

import (
	"fmt"

	"github.com/bclswl0827/go-serial"
)

func Write(port *serial.Port, p []byte, flush bool) (int, error) {
	if port == nil {
		return -1, fmt.Errorf("port is nil")
	}

	if flush {
		port.ResetOutputBuffer()
	}

	n, err := port.Write(p)
	if err != nil {
		return n, err
	}

	return n, nil
}
