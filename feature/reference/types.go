package reference

import "io"

const TOPIC_NAME = "reference"

type Reference struct {
	serialPort io.ReadWriteCloser
}
