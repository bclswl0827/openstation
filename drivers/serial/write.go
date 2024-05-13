package serial

import (
	"fmt"
	"io"
)

func Write(port io.ReadWriteCloser, p []byte) (int, error) {
	if port == nil {
		return -1, fmt.Errorf("port is nil")
	}

	n, err := port.Write(p)
	if err != nil {
		return n, err
	}

	return n, nil
}
