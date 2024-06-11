package serial

import (
	"fmt"
	"io"
	"time"

	"github.com/bclswl0827/go-serial"
)

func Read(r *serial.Port, buf []byte, timeout time.Duration, flush bool) (n int, err error) {
	if r == nil {
		return -1, fmt.Errorf("port is nil")
	}

	if flush {
		r.ResetInputBuffer()
	}

	min := len(buf)

	if len(buf) < min {
		return 0, io.ErrShortBuffer
	}

	start := time.Now()
	for n < min {
		if time.Since(start) > timeout {
			return 0, fmt.Errorf("timeout due to no response")
		}

		nn, err := r.Read(buf[n:])
		if err != nil {
			return 0, err
		}

		n += nn
	}

	if n >= min {
		err = nil
	} else if n > 0 && err == io.EOF {
		err = io.ErrUnexpectedEOF
	}

	return n, err
}
