package monitor

import (
	"errors"
	"io"
	"strings"

	"github.com/bclswl0827/openstation/driver/serial"
)

const (
	DISPLAY_WIDTH  = 16
	DISPLAY_HEIGHT = 2
)

const (
	SYNC_WORD = 0xFF
	ACK_WORD  = 0xEE
	NACK_WORD = 0xDD
	CLEAR_CMD = 0x00
	PRINT_CMD = 0x01
	RESET_CMD = 0x02
)

type LCD1602DriverImpl struct{}

func (d *LCD1602DriverImpl) Display(port io.ReadWriteCloser, status Status, str string, x, y int) error {
	strArr := strings.Split(str, "\n")
	if len(strArr) > DISPLAY_HEIGHT {
		return errors.New("string height exceeds display size")
	}

	led := 0x00
	if status.Busy {
		led |= 0x02
	}
	if status.Error {
		led |= 0x04
	}

	for i, line := range strArr {
		if len(line) > DISPLAY_WIDTH {
			return errors.New("string length exceeds display size")
		}
		for j, ch := range line {
			_, err := port.Write([]byte{
				SYNC_WORD,
				PRINT_CMD,
				byte(x + j),
				byte(y + i),
				byte(ch),
				byte(led),
			})
			if err != nil {
				return err
			}
			serial.Filter(port, []byte{ACK_WORD}, 1)
		}
	}

	return nil
}

func (d *LCD1602DriverImpl) Clear(port io.ReadWriteCloser) error {
	_, err := port.Write([]byte{SYNC_WORD, CLEAR_CMD})
	if err != nil {
		return err
	}

	serial.Filter(port, []byte{ACK_WORD}, 1)
	return nil
}

func (d *LCD1602DriverImpl) Reset(port io.ReadWriteCloser) error {
	_, err := port.Write([]byte{SYNC_WORD, RESET_CMD})
	if err != nil {
		return err
	}

	serial.Filter(port, []byte{ACK_WORD}, 1)
	return nil
}

func (d *LCD1602DriverImpl) Init(port io.ReadWriteCloser) error {
	err := d.Reset(port)
	if err != nil {
		return err
	}

	err = d.Clear(port)
	if err != nil {
		return err
	}

	return nil
}
