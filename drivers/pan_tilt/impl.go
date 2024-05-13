package pan_tilt

import (
	"fmt"
	"io"
	"math"
	"time"

	"github.com/bclswl0827/openstation/drivers/serial"
)

const (
	SYNC_WORD    = 0xFF
	SLAVE_ADDR   = 0x01
	READ_TIMEOUT = 5 * time.Second
)

type PanTiltDriverImpl struct{}

func (*PanTiltDriverImpl) getChecksum(data []byte) byte {
	var checksum int
	for _, b := range data {
		checksum += int(b)
	}

	return byte(checksum % 256)
}

func (d *PanTiltDriverImpl) IsAvailable(port io.ReadWriteCloser) bool {
	_, err := d.GetPan(port)
	return err == nil
}

func (d *PanTiltDriverImpl) Init(port io.ReadWriteCloser) error {
	sig := make(chan bool)

	err := d.SetPan(port, 0, 0, sig)
	if err != nil {
		return err
	}
	<-sig

	err = d.SetTilt(port, 90, sig)
	if err != nil {
		return err
	}
	<-sig

	return nil
}

func (d *PanTiltDriverImpl) Reset(port io.ReadWriteCloser, sig chan bool) error {
	resetCmd := []byte{SLAVE_ADDR, 0x00, 0x0F, 0x00, 0x00}
	checksum := d.getChecksum(resetCmd)
	resetCmd = append(resetCmd, checksum)

	// Wait for 300ms before sending reset command
	time.Sleep(300 * time.Millisecond)
	_, err := serial.Write(port, append([]byte{SYNC_WORD}, resetCmd...))
	if err != nil {
		return err
	}

	// Reset takes approximately 130 seconds
	if sig != nil {
		go func() {
			time.Sleep(130 * time.Second)
			sig <- true
		}()
	}

	return nil
}

func (d *PanTiltDriverImpl) GetPan(port io.ReadWriteCloser) (float64, error) {
	// To ensure next command is not sent too early
	time.Sleep(50 * time.Millisecond)

	// Send query command and wait approximately 50ms
	queryCmd := []byte{SLAVE_ADDR, 0x00, 0x51, 0x00, 0x00, 0x52}
	_, err := serial.Write(port, append([]byte{SYNC_WORD}, queryCmd...))
	if err != nil {
		return 0, err
	}
	time.Sleep(100 * time.Millisecond)

	// Read response
	response := make([]byte, 7)
	_, err = serial.Read(port, response, READ_TIMEOUT)
	if err != nil {
		return 0, err
	}

	// Check if first byte is SYNC_WORD
	if response[0] != SYNC_WORD {
		return 0, fmt.Errorf("invalid response, expected SYNC_WORD %d, got %d", SYNC_WORD, response[0])
	}

	// Check response checksum
	if d.getChecksum(response[1:6]) != response[6] {
		return 0, fmt.Errorf("checksum mismatch, expected %d, got %d", d.getChecksum(response[:5]), response[5])
	}

	// Calculate pan angle
	pmsb, plsb := response[4], response[5]
	panAngle := (float64(pmsb)*256 + float64(plsb)) / 100
	return panAngle, nil
}

func (d *PanTiltDriverImpl) SetPan(port io.ReadWriteCloser, pan, offset float64, sig chan bool) error {
	encodedPan := int(pan * 100)
	pmsb, plsb := byte(encodedPan>>8), byte(encodedPan&0xFF)

	setCmd := []byte{SLAVE_ADDR, 0x00, 0x4B, pmsb, plsb}
	checksum := d.getChecksum(setCmd)
	setCmd = append(setCmd, checksum)

	// Send set command
	_, err := serial.Write(port, append([]byte{SYNC_WORD}, setCmd...))
	if err != nil {
		return err
	}

	if sig != nil {
		go func() {
			for i := 0; ; i++ {
				currentPan, err := d.GetPan(port)
				if err != nil {
					continue
				}

				// Check if currentPan is within ERROR_THRESHOLD
				if math.Abs(currentPan-pan) <= ERROR_THRESHOLD || math.Abs(currentPan-360-pan) <= ERROR_THRESHOLD {
					sig <- true
					return
				}

				if i == math.MaxUint8 {
					sig <- false
					return
				}
			}
		}()
	}

	return nil
}

func (d *PanTiltDriverImpl) GetTilt(port io.ReadWriteCloser) (float64, error) {
	// To ensure next command is not sent too early
	time.Sleep(50 * time.Millisecond)

	// Send query command and wait approximately 50ms
	queryCmd := []byte{SLAVE_ADDR, 0x00, 0x53, 0x00, 0x00, 0x54}
	_, err := serial.Write(port, append([]byte{SYNC_WORD}, queryCmd...))
	if err != nil {
		return 0, err
	}
	time.Sleep(100 * time.Millisecond)

	// Read response
	response := make([]byte, 7)
	_, err = serial.Read(port, response, READ_TIMEOUT)
	if err != nil {
		return 0, err
	}

	// Check if first byte is SYNC_WORD
	if response[0] != SYNC_WORD {
		return 0, fmt.Errorf("invalid response, expected SYNC_WORD %d, got %d", SYNC_WORD, response[0])
	}

	// Check response checksum
	if d.getChecksum(response[1:6]) != response[6] {
		return 0, fmt.Errorf("checksum mismatch, expected %d, got %d", d.getChecksum(response[:5]), response[5])
	}

	// Calculate tilt angle
	tmsb, tlsb := response[4], response[5]
	tdata1, tdata2 := (float64(tmsb)*256)+float64(tlsb), float64(0)
	if tdata1 > 18000 {
		tdata2 = 36000 - tdata1
	} else {
		tdata2 = tdata1
	}

	tiltAngle := tdata2 / 100
	return 90 - tiltAngle, nil
}

func (d *PanTiltDriverImpl) SetTilt(port io.ReadWriteCloser, tilt float64, sig chan bool) error {
	if tilt < 5 {
		return fmt.Errorf("tilt angle must be greater than or equal to 5 degrees")
	} else if tilt > 90 {
		return fmt.Errorf("tilt angle must be less than or equal to 90 degrees")
	}

	encodedTilt := int((90 - tilt) * 100)
	tmsb, tlsb := byte(encodedTilt>>8), byte(encodedTilt&0xFF)

	setCmd := []byte{SLAVE_ADDR, 0x00, 0x4D, tmsb, tlsb}
	checksum := d.getChecksum(setCmd)
	setCmd = append(setCmd, checksum)

	// Send set command
	_, err := serial.Write(port, append([]byte{SYNC_WORD}, setCmd...))
	if err != nil {
		return err
	}

	if sig != nil {
		go func() {
			for i := 0; ; i++ {
				currentTilt, err := d.GetTilt(port)
				if err != nil {
					continue
				}

				// Check if currentTilt is within ERROR_THRESHOLD
				if math.Abs(currentTilt-tilt) <= ERROR_THRESHOLD {
					sig <- true
					return
				}

				if i == math.MaxUint8 {
					sig <- false
					return
				}
			}
		}()
	}

	return nil
}
