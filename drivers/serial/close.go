package serial

import "github.com/bclswl0827/go-serial"

func Close(port *serial.Port) error {
	if port == nil {
		return nil
	}

	return port.Close()
}
