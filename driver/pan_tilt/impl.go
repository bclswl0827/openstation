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

func (d *PanTiltImpl) IsAvailable(port io.ReadWriteCloser) bool {
	_, err := d.GetTilt(port)
	return err == nil
}

func (d *PanTiltImpl) Init(port io.ReadWriteCloser) error {
	err := d.SetTilt(port, 0, 0, nil)
	if err != nil {
		return err
	}
	time.Sleep(100 * time.Millisecond)

	for i := 0; ; i++ {
		tilt, err := d.GetTilt(port)
		if err != nil {
			continue
		}

		// Check if tilt is within ERROR_THRESHOLD
		if math.Abs(tilt) <= ERROR_THRESHOLD {
			break
		}

		if i == math.MaxInt8 {
			return fmt.Errorf("failed to set tilt to 0 degree, expected 0, got tilt: %f", tilt)
		}

		time.Sleep(10 * time.Millisecond)
	}

	err = d.SetPan(port, 0, 0, nil)
	if err != nil {
		return err
	}
	time.Sleep(100 * time.Millisecond)

	for i := 0; ; i++ {
		pan, err := d.GetPan(port)
		if err != nil {
			continue
		}

		// Check if pan is within ERROR_THRESHOLD
		if math.Abs(pan) <= ERROR_THRESHOLD || math.Abs(pan-360) <= ERROR_THRESHOLD {
			break
		}

		if i == math.MaxUint8 {
			return fmt.Errorf("failed to set pan to 0 degree, expected 0, got pan: %f", pan)
		}

		time.Sleep(10 * time.Millisecond)
	}

	return nil
}

func (d *PanTiltImpl) Reset(port io.ReadWriteCloser, sig chan bool) error {
	resetCmd := []byte{SLAVE_ADDR, 0x00, 0x0F, 0x00, 0x00}
	checksum := d.getChecksum(resetCmd)
	resetCmd = append(resetCmd, checksum)

	// Send command 3 times to ensure device reset
	for i := 0; i < 3; i++ {
		serial.Write(port, append([]byte{SYNC_WORD}, resetCmd...))
		time.Sleep(300 * time.Millisecond)
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

func (d *PanTiltImpl) GetPan(port io.ReadWriteCloser) (float64, error) {
	queryCmd := []byte{SLAVE_ADDR, 0x00, 0x51, 0x00, 0x00}
	checksum := d.getChecksum(queryCmd)
	queryCmd = append(queryCmd, checksum)

	// Send query command
	_, err := serial.Write(port, append([]byte{SYNC_WORD}, queryCmd...))
	if err != nil {
		return 0, err
	}

	// Filter response's SYNC_WORD
	err = serial.Filter(port, []byte{SYNC_WORD}, math.MaxUint8)
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

func (d *PanTiltImpl) SetPan(port io.ReadWriteCloser, pan, offset float64, sig chan bool) error {
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
	time.Sleep(100 * time.Millisecond)

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

				time.Sleep(10 * time.Millisecond)
			}
		}()
	}

	return nil
}

func (d *PanTiltImpl) GetTilt(port io.ReadWriteCloser) (float64, error) {
	queryCmd := []byte{SLAVE_ADDR, 0x00, 0x53, 0x00, 0x00}
	checksum := d.getChecksum(queryCmd)
	queryCmd = append(queryCmd, checksum)

	// Send query command
	_, err := serial.Write(port, append([]byte{SYNC_WORD}, queryCmd...))
	if err != nil {
		return 0, err
	}

	// Filter response's SYNC_WORD
	err = serial.Filter(port, []byte{SYNC_WORD}, math.MaxUint8)
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

func (d *PanTiltImpl) SetTilt(port io.ReadWriteCloser, tilt, offset float64, sig chan bool) error {
	if tilt < 0 {
		return fmt.Errorf("tilt angle must be positive")
	}

	tmsb, tlsb := byte(0), byte(0)
	encodedTilt := int(tilt * 100)
	tmsb, tlsb = byte(encodedTilt>>8), byte(encodedTilt&0xFF)

	setCmd := []byte{SLAVE_ADDR, 0x00, 0x4D, tmsb, tlsb}
	checksum := d.getChecksum(setCmd)
	setCmd = append(setCmd, checksum)

	// Send set command
	_, err := serial.Write(port, append([]byte{SYNC_WORD}, setCmd...))
	if err != nil {
		return err
	}
	time.Sleep(100 * time.Millisecond)

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

				time.Sleep(10 * time.Millisecond)
			}
		}()
	}

	return nil
}
