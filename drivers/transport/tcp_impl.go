package transport

import (
	"bytes"
	"fmt"
	"net"
	"net/url"
	"time"
)

type TransportDriverTcpImpl struct {
	conn net.Conn
}

func (t *TransportDriverTcpImpl) Open(deps *TransportDependency) error {
	u, err := url.Parse(deps.DSN)
	if err != nil {
		return err
	}

	conn, err := net.Dial("tcp", u.Host)
	if err != nil {
		return err
	}

	t.conn = conn
	return nil
}

func (t *TransportDriverTcpImpl) Close() error {
	return t.conn.Close()
}

func (t *TransportDriverTcpImpl) Read(buf []byte, timeout time.Duration, flush bool) (int, error) {
	t.conn.SetReadDeadline(time.Now().Add(timeout))
	return t.conn.Read(buf)
}

func (t *TransportDriverTcpImpl) Write(buf []byte, flush bool) (int, error) {
	return t.conn.Write(buf)
}

func (t *TransportDriverTcpImpl) Filter(signature []byte, filter_attempts int) error {
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

	return fmt.Errorf("failed to filter header")
}
