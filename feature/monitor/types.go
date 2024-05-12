package monitor

import (
	"io"
	"time"
)

const TOPIC_NAME = "monitor"
const DISPLAY_INTERVAL = time.Second * 3

type Monitor struct {
	serialPort io.ReadWriteCloser
}
