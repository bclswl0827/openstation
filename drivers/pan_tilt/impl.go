package pan_tilt

import (
	"errors"
	"fmt"
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

func (d *PanTiltDriverImpl) IsAvailable(deps *PanTiltDependency) bool {
	return d.GetPan(deps) == nil
}

func (d *PanTiltDriverImpl) Init(deps *PanTiltDependency) error {
	if deps == nil {
		return errors.New("dependency is not provided")
	}

	sig := make(chan bool)

	err := d.SetPan(deps, 0, sig)
	if err != nil {
		return err
	}
	<-sig

	err = d.SetTilt(deps, 90, sig)
	if err != nil {
		return err
	}
	<-sig

	return nil
}

func (d *PanTiltDriverImpl) Reset(deps *PanTiltDependency, sig chan<- bool) error {
	if deps == nil {
		return errors.New("dependency is not provided")
	}

	resetCmd := []byte{SLAVE_ADDR, 0x00, 0x0F, 0x00, 0x00}
	checksum := d.getChecksum(resetCmd)
	resetCmd = append(resetCmd, checksum)

	// Wait for 300ms before sending reset command
	time.Sleep(300 * time.Millisecond)
	_, err := serial.Write(deps.Port, append([]byte{SYNC_WORD}, resetCmd...))
	if err != nil {
		return err
	}

	// Reset takes approximately 120 seconds
	if sig != nil {
		go func() {
			time.Sleep(120 * time.Second)
			sig <- true
		}()
	}

	return nil
}

func (d *PanTiltDriverImpl) GetPan(deps *PanTiltDependency) error {
	if deps == nil {
		return errors.New("dependency is not provided")
	}

	// To ensure next command is not sent too early
	time.Sleep(50 * time.Millisecond)

	// Send query command and wait approximately 50ms
	queryCmd := []byte{SLAVE_ADDR, 0x00, 0x51, 0x00, 0x00, 0x52}
	_, err := serial.Write(deps.Port, append([]byte{SYNC_WORD}, queryCmd...))
	if err != nil {
		return err
	}
	time.Sleep(100 * time.Millisecond)

	// Read response
	response := make([]byte, 7)
	_, err = serial.Read(deps.Port, response, READ_TIMEOUT)
	if err != nil {
		return err
	}

	// Check if first byte is SYNC_WORD
	if response[0] != SYNC_WORD {
		return fmt.Errorf("invalid response, expected SYNC_WORD %d, got %d", SYNC_WORD, response[0])
	}

	// Check response checksum
	if d.getChecksum(response[1:6]) != response[6] {
		return fmt.Errorf("checksum mismatch, expected %d, got %d", d.getChecksum(response[:5]), response[5])
	}

	// Calculate pan angle
	pmsb, plsb := response[4], response[5]
	deps.CurrentPan = (float64(pmsb)*256 + float64(plsb)) / 100
	return nil
}

func (d *PanTiltDriverImpl) SetPan(deps *PanTiltDependency, newPan float64, sig chan<- bool) error {
	if deps == nil {
		return errors.New("dependency is not provided")
	}

	if newPan > MAX_PAN || newPan < MIN_PAN {
		return fmt.Errorf("pan angle must be between %d and %d degrees", MIN_PAN, MAX_PAN)
	}

	// Check if pan tilt is currently busy
	if deps.IsBusy {
		return errors.New("Pan-Tilt is currently busy")
	}
	deps.IsBusy = true

	// Calculate encoded pan with north offset
	if deps.NorthOffset != 0 {
		newPan = 360 - deps.NorthOffset + newPan
	}

	encodedPan := int(newPan * 100)
	pmsb, plsb := byte(encodedPan>>8), byte(encodedPan&0xFF)

	setCmd := []byte{SLAVE_ADDR, 0x00, 0x4B, pmsb, plsb}
	checksum := d.getChecksum(setCmd)
	setCmd = append(setCmd, checksum)

	// Send set command
	_, err := serial.Write(deps.Port, append([]byte{SYNC_WORD}, setCmd...))
	if err != nil {
		deps.IsBusy = false
		return err
	}

	if sig != nil {
		go func() {
			for i := 0; ; i++ {
				err := d.GetPan(deps)
				if err != nil {
					continue
				}

				// Check if currentPan is within ERROR_THRESHOLD
				if math.Abs(deps.CurrentPan-newPan) <= ERROR_THRESHOLD || math.Abs(deps.CurrentPan-360-newPan) <= ERROR_THRESHOLD {
					deps.IsBusy = false
					sig <- true
					return
				}

				if i == math.MaxUint8 {
					deps.IsBusy = false
					sig <- false
					return
				}
			}
		}()
	}

	deps.IsBusy = false
	return nil
}

func (d *PanTiltDriverImpl) GetTilt(deps *PanTiltDependency) error {
	if deps == nil {
		return errors.New("dependency is not provided")
	}

	// To ensure next command is not sent too early
	time.Sleep(50 * time.Millisecond)

	// Send query command and wait approximately 50ms
	queryCmd := []byte{SLAVE_ADDR, 0x00, 0x53, 0x00, 0x00, 0x54}
	_, err := serial.Write(deps.Port, append([]byte{SYNC_WORD}, queryCmd...))
	if err != nil {
		return err
	}
	time.Sleep(100 * time.Millisecond)

	// Read response
	response := make([]byte, 7)
	_, err = serial.Read(deps.Port, response, READ_TIMEOUT)
	if err != nil {
		return err
	}

	// Check if first byte is SYNC_WORD
	if response[0] != SYNC_WORD {
		return fmt.Errorf("invalid response, expected SYNC_WORD %d, got %d", SYNC_WORD, response[0])
	}

	// Check response checksum
	if d.getChecksum(response[1:6]) != response[6] {
		return fmt.Errorf("checksum mismatch, expected %d, got %d", d.getChecksum(response[:5]), response[5])
	}

	// Calculate tilt angle
	tmsb, tlsb := response[4], response[5]
	tdata1, tdata2 := (float64(tmsb)*256)+float64(tlsb), float64(0)
	if tdata1 > 18000 {
		tdata2 = 36000 - tdata1
	} else {
		tdata2 = tdata1
	}

	deps.CurrentTilt = 90 - (tdata2 / 100)
	return nil
}

func (d *PanTiltDriverImpl) SetTilt(deps *PanTiltDependency, newTilt float64, sig chan<- bool) error {
	if deps == nil {
		return errors.New("dependency is not provided")
	}

	if newTilt < MIN_TILT || newTilt > MAX_TILT {
		return fmt.Errorf("tilt angle must be between %d and %d degrees", MIN_TILT, MAX_TILT)
	}

	// Check if pan tilt is currently busy
	if deps.IsBusy {
		return errors.New("Pan-Tilt is currently busy")
	}
	deps.IsBusy = true

	encodedTilt := int((90 - newTilt) * 100)
	tmsb, tlsb := byte(encodedTilt>>8), byte(encodedTilt&0xFF)

	setCmd := []byte{SLAVE_ADDR, 0x00, 0x4D, tmsb, tlsb}
	checksum := d.getChecksum(setCmd)
	setCmd = append(setCmd, checksum)

	// Send set command
	_, err := serial.Write(deps.Port, append([]byte{SYNC_WORD}, setCmd...))
	if err != nil {
		deps.IsBusy = false
		return err
	}

	if sig != nil {
		go func() {
			for i := 0; ; i++ {
				err := d.GetTilt(deps)
				if err != nil {
					continue
				}

				// Check if currentTilt is within ERROR_THRESHOLD
				if math.Abs(deps.CurrentTilt-newTilt) <= ERROR_THRESHOLD {
					deps.IsBusy = false
					sig <- true
					return
				}

				if i == math.MaxUint8 {
					deps.IsBusy = false
					sig <- false
					return
				}
			}
		}()
	}

	deps.IsBusy = false
	return nil
}
