package pan_tilt

import (
	"io"
)

const TOPIC_NAME = "pan_tilt"

type PanTilt struct {
	serialPort io.ReadWriteCloser
}
