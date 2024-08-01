package transport

import (
	"bytes"
	"errors"
	"fmt"
	"net/url"
	"strconv"
	"time"

	"github.com/bclswl0827/go-serial"
)

type TransportDriverSerialImpl struct {
	conn *serial.Port
}

func (t *TransportDriverSerialImpl) Open(deps *TransportDependency) error {
	u, err := url.Parse(deps.DSN)
	if err != nil {
		return err
	}

	deviceName := u.Host
	if len(deviceName) == 0 {
		deviceName = u.Path
	}

	baudrate, err := strconv.Atoi(u.Query().Get("baudrate"))
	if err != nil {
		return err
	}

	conn, err := serial.Open(
		deviceName,
		serial.WithHUPCL(true),
		serial.WithDataBits(8),
		serial.WithReadTimeout(1),
		serial.WithWriteTimeout(1),
		serial.WithBaudrate(baudrate),
		serial.WithParity(serial.NoParity),
		serial.WithStopBits(serial.OneStopBit),
	)
	if err != nil {
		return fmt.Errorf("%v %s", err, deviceName)
	}

	conn.SetDTR(true)
	conn.SetRTS(true)

	t.conn = conn
	return nil
}

func (t *TransportDriverSerialImpl) Close() error {
	if t.conn == nil {
		return errors.New("connection is not opened")
	}

	return t.conn.Close()
}

func (t *TransportDriverSerialImpl) Read(buf []byte, timeout time.Duration, flush bool) (int, error) {
	if t.conn == nil {
		return 0, errors.New("connection is not opened")
	}

	if flush {
		t.conn.ResetInputBuffer()
	}
	t.conn.SetReadTimeout(int(timeout.Milliseconds()))
	return t.conn.Read(buf)
}

func (t *TransportDriverSerialImpl) Write(buf []byte, flush bool) (int, error) {
	if t.conn == nil {
		return 0, errors.New("connection is not opened")
	}

	if flush {
		t.conn.ResetOutputBuffer()
	}
	return t.conn.Write(buf)
}

func (t *TransportDriverSerialImpl) Filter(signature []byte, filter_attempts int) error {
	if t.conn == nil {
		return errors.New("connection is not opened")
	}

	t.conn.ResetInputBuffer()
	t.conn.ResetOutputBuffer()

	header := make([]byte, len(signature))
	for i := 0; i < filter_attempts; i++ {
		_, err := t.conn.Read(header)
		if err != nil {
			return err
		}

		if bytes.Equal(header, signature) {
			return nil
		} else {
			time.Sleep(time.Millisecond)
		}
	}

	return errors.New("failed to filter header")
}
