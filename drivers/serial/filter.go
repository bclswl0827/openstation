package serial

import (
	"bytes"
	"fmt"
	"time"

	"github.com/bclswl0827/go-serial"
)

func Filter(port *serial.Port, signature []byte, filter_attempts int) error {
	if port == nil {
		return fmt.Errorf("port is nil")
	}

	port.ResetInputBuffer()
	port.ResetOutputBuffer()

	header := make([]byte, len(signature))
	for i := 0; i < filter_attempts; i++ {
		_, err := port.Read(header)
		if err != nil {
			return err
		}

		if bytes.Equal(header, signature) {
			return nil
		} else {
			time.Sleep(time.Millisecond)
		}
	}

	return fmt.Errorf("failed to filter header")
}
