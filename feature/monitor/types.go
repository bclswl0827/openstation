package monitor

import "io"

const TOPIC_NAME = "monitor"

type Monitor struct {
	serialPort io.ReadWriteCloser
}
