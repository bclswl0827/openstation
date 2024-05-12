package monitor

import (
	"errors"
	"io"
	"math"
	"strings"

	"github.com/bclswl0827/openstation/driver/serial"
)

const (
	DISPLAY_WIDTH  = 16
	DISPLAY_HEIGHT = 2
)

const (
	SYNC_WORD  = 0xFF
	ACK_WORD   = 0xEE
	NACK_WORD  = 0xDD
	DUMMY_WORD = 0xCC
	CLEAR_CMD  = 0x00
	PRINT_CMD  = 0x01
	RESET_CMD  = 0x02
)

type MonitorDriverImpl struct{}

func (d *MonitorDriverImpl) Display(port io.ReadWriteCloser, state *MonitorState, str string, x, y int) error {
	strArr := strings.Split(str, "\n")
	if len(strArr) > DISPLAY_HEIGHT {
		return errors.New("string lines exceeds display size")
	}

	// If string is less than display width, pad it with spaces
	for i, line := range strArr {
		if len(line) < DISPLAY_WIDTH {
			strArr[i] = line + strings.Repeat(" ", DISPLAY_WIDTH-len(line))
		}
	}

	led := DUMMY_WORD
	if state != nil {
		led = 0x00
		if state.Busy {
			led |= 0x01
		}
		if state.Error {
			led |= 0x02
		}
	}

	// To ensure that the text is displayed correctly
	for i := 0; i < 2; i++ {
		for columnIndex, column := range strArr {
			if len(column) > DISPLAY_WIDTH {
				return errors.New("string length exceeds display size")
			}
			for charIndex, char := range column {
				_, err := serial.Write(port, []byte{
					SYNC_WORD,
					PRINT_CMD,
					byte(x + charIndex),
					byte(y + columnIndex),
					byte(char),
					byte(led),
				})
				if err != nil {
					return err
				}

				serial.Filter(port, []byte{ACK_WORD}, math.MaxInt8)
			}
		}
	}

	return nil
}

func (d *MonitorDriverImpl) Clear(port io.ReadWriteCloser) error {
	_, err := serial.Write(port, []byte{SYNC_WORD, CLEAR_CMD})
	if err != nil {
		return err
	}

	serial.Filter(port, []byte{ACK_WORD}, math.MaxInt8)
	return nil
}

func (d *MonitorDriverImpl) Reset(port io.ReadWriteCloser) error {
	_, err := serial.Write(port, []byte{SYNC_WORD, RESET_CMD})
	if err != nil {
		return err
	}

	serial.Filter(port, []byte{ACK_WORD}, math.MaxInt8)
	return nil
}

func (d *MonitorDriverImpl) Init(port io.ReadWriteCloser) error {
	return d.Clear(port)
}
