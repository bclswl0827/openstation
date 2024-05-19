package monitor

import (
	"errors"
	"fmt"
	"math"
	"strings"

	"github.com/bclswl0827/openstation/drivers/serial"
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

func (d *MonitorDriverImpl) Display(deps *MonitorDependency, str string, x, y int) error {
	if deps == nil {
		return fmt.Errorf("dependency is not provided")
	}

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
	if deps.State != nil {
		led = 0x00
		if deps.State.Busy {
			led |= 0x01
		}
		if deps.State.Error {
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
				_, err := serial.Write(deps.Port, []byte{
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

				serial.Filter(deps.Port, []byte{ACK_WORD}, math.MaxInt8)
			}
		}
	}

	return nil
}

func (d *MonitorDriverImpl) Clear(deps *MonitorDependency) error {
	if deps == nil {
		return fmt.Errorf("dependency is not provided")
	}

	_, err := serial.Write(deps.Port, []byte{SYNC_WORD, CLEAR_CMD})
	if err != nil {
		return err
	}

	serial.Filter(deps.Port, []byte{ACK_WORD}, math.MaxInt8)
	return nil
}

func (d *MonitorDriverImpl) Reset(deps *MonitorDependency) error {
	if deps == nil {
		return fmt.Errorf("dependency is not provided")
	}

	_, err := serial.Write(deps.Port, []byte{SYNC_WORD, RESET_CMD})
	if err != nil {
		return err
	}

	serial.Filter(deps.Port, []byte{ACK_WORD}, math.MaxInt8)
	return nil
}

func (d *MonitorDriverImpl) Init(deps *MonitorDependency) error {
	return d.Clear(deps)
}
