package monitor

import (
	"errors"
	"fmt"
	"math"
	"strings"
	"time"

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

func (d *MonitorDriverImpl) getChecksum(cmd []byte) byte {
	var checksum byte
	for _, v := range cmd {
		checksum ^= v
	}

	return checksum
}

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

	writeTimes := 1
	if deps.ForceMode {
		writeTimes = 2
	}

	for i := 0; i < writeTimes; i++ {
		for columnIndex, column := range strArr {
			if len(column) > DISPLAY_WIDTH {
				return errors.New("string length exceeds display size")
			}
			for charIndex := 0; charIndex < len(column); {
				cmd := []byte{
					SYNC_WORD,
					PRINT_CMD,
					byte(x + charIndex),
					byte(y + columnIndex),
					byte(column[charIndex]),
					byte(led),
				}

				_, err := serial.Write(deps.Port, append(cmd, d.getChecksum(cmd)), true)
				if err != nil {
					return err
				}

				err = serial.Filter(deps.Port, []byte{ACK_WORD}, math.MaxInt8)
				if err != nil {
					continue
				}

				charIndex++
			}
		}
	}

	return nil
}

func (d *MonitorDriverImpl) Clear(deps *MonitorDependency) error {
	if deps == nil {
		return fmt.Errorf("dependency is not provided")
	}

	cmd := []byte{SYNC_WORD, CLEAR_CMD}
	_, err := serial.Write(deps.Port, append(cmd, d.getChecksum(cmd)), true)
	if err != nil {
		return err
	}

	time.Sleep(time.Second)
	return nil
}

func (d *MonitorDriverImpl) Reset(deps *MonitorDependency) error {
	if deps == nil {
		return fmt.Errorf("dependency is not provided")
	}

	cmd := []byte{SYNC_WORD, RESET_CMD}
	_, err := serial.Write(deps.Port, append(cmd, d.getChecksum(cmd)), true)
	if err != nil {
		return err
	}

	time.Sleep(2 * time.Second)
	return nil
}

func (d *MonitorDriverImpl) Init(deps *MonitorDependency) error {
	return d.Clear(deps)
}
