package pan_tilt

import (
	"fmt"
	"io"
	"math"
	"time"

	"github.com/bclswl0827/openstation/driver/serial"
)

const (
	SYNC_WORD    = 0xFF
	SLAVE_ADDR   = 0x01
	READ_TIMEOUT = 5 * time.Second
)

type PanTiltImpl struct{}

func (*PanTiltImpl) getChecksum(data []byte) byte {
	var checksum int
	for _, b := range data {
		checksum += int(b)
	}

	return byte(checksum % 256)
}

func (d *PanTiltImpl) Reset(port io.ReadWriteCloser) error {
	resetCmd := []byte{SLAVE_ADDR, 0x00, 0x0F, 0x00, 0x00}
	checksum := d.getChecksum(resetCmd)
	resetCmd = append(resetCmd, checksum)

	// Send reset command
	_, err := port.Write(append([]byte{SYNC_WORD}, resetCmd...))
	if err != nil {
		return err
	}

	return nil
}

func (d *PanTiltImpl) IsAvailable(port io.ReadWriteCloser) (bool, error) {
	return true, nil
}

func (d *PanTiltImpl) GetPan(port io.ReadWriteCloser) (float64, error) {
	queryCmd := []byte{SLAVE_ADDR, 0x00, 0x51, 0x00, 0x00}
	checksum := d.getChecksum(queryCmd)
	queryCmd = append(queryCmd, checksum)

	// Send query command
	_, err := port.Write(append([]byte{SYNC_WORD}, queryCmd...))
	if err != nil {
		return 0, err
	}

	// Filter response's SYNC_WORD
	err = serial.Filter(port, []byte{SYNC_WORD}, math.MaxInt8)
	if err != nil {
		return 0, err
	}

	// Read response
	response := make([]byte, 6)
	_, err = serial.Read(port, response, READ_TIMEOUT)
	if err != nil {
		return 0, err
	}

	// Check response checksum
	if d.getChecksum(response[:5]) != response[5] {
		return 0, fmt.Errorf("checksum mismatch, expected %d, got %d", d.getChecksum(response[:5]), response[5])
	}

	// Calculate pan angle
	pmsb, plsb := response[3], response[4]
	panAngle := (float64(pmsb)*256 + float64(plsb)) / 100
	return panAngle, nil
}

func (d *PanTiltImpl) SetPan(port io.ReadWriteCloser, pan, offset float64) error {
	encodedPan := int(pan * 100)
	pmsb, plsb := byte(encodedPan>>8), byte(encodedPan&0xFF)

	setCmd := []byte{SLAVE_ADDR, 0x00, 0x4B, pmsb, plsb}
	checksum := d.getChecksum(setCmd)
	setCmd = append(setCmd, checksum)

	// Send set command
	_, err := port.Write(append([]byte{SYNC_WORD}, setCmd...))
	if err != nil {
		return err
	}

	return nil
}

func (d *PanTiltImpl) GetTilt(port io.ReadWriteCloser) (float64, error) {
	queryCmd := []byte{SLAVE_ADDR, 0x00, 0x53, 0x00, 0x00}
	checksum := d.getChecksum(queryCmd)
	queryCmd = append(queryCmd, checksum)

	// Send query command
	_, err := port.Write(append([]byte{SYNC_WORD}, queryCmd...))
	if err != nil {
		return 0, err
	}

	// Filter response's SYNC_WORD
	err = serial.Filter(port, []byte{SYNC_WORD}, math.MaxInt8)
	if err != nil {
		return 0, err
	}

	// Read response
	response := make([]byte, 6)
	_, err = serial.Read(port, response, READ_TIMEOUT)
	if err != nil {
		return 0, err
	}

	// Check response checksum
	if d.getChecksum(response[:5]) != response[5] {
		return 0, fmt.Errorf("checksum mismatch, expected %d, got %d", d.getChecksum(response[:5]), response[5])
	}

	// Calculate tilt angle
	tmsb, tlsb := response[3], response[4]
	tdata1, tdata2 := (float64(tmsb)*256)+float64(tlsb), float64(0)
	if tdata1 > 18000 {
		tdata2 = 36000 - tdata1
	} else {
		tdata2 = tdata1
	}

	tiltAngle := tdata2 / 100
	return tiltAngle, nil
}

func (d *PanTiltImpl) SetTilt(port io.ReadWriteCloser, tilt, offset float64) error {
	if tilt < 0 {
		return fmt.Errorf("tilt angle must be positive")
	}

	tilt += offset
	if tilt >= 360 {
		tilt -= 360
	}

	tmsb, tlsb := byte(0), byte(0)
	encodedTilt := int(tilt * 100)
	tmsb, tlsb = byte(encodedTilt>>8), byte(encodedTilt&0xFF)

	setCmd := []byte{SLAVE_ADDR, 0x00, 0x4D, tmsb, tlsb}
	checksum := d.getChecksum(setCmd)
	setCmd = append(setCmd, checksum)

	// Send set command
	_, err := port.Write(append([]byte{SYNC_WORD}, setCmd...))
	if err != nil {
		return err
	}

	return nil
}
