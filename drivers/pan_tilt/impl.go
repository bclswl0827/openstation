package pan_tilt

import (
	"errors"
	"fmt"
	"math"
	"sync"
	"time"

	"github.com/bclswl0827/openstation/drivers/serial"
)

const (
	SYNC_WORD   = 0xFF
	SLAVE_ADDR  = 0x01
	DUMMY_VALUE = -ERROR_THRESHOLD * 10
)

type PanTiltDriverImpl struct {
	mutex sync.Mutex
}

func (*PanTiltDriverImpl) getChecksum(data []byte) byte {
	var checksum int
	for _, b := range data {
		checksum += int(b)
	}

	return byte(checksum % 256)
}

func (d *PanTiltDriverImpl) getPan(deps *PanTiltDependency) (float64, error) {
	if deps == nil {
		return DUMMY_VALUE, errors.New("dependency is not provided")
	}

	d.mutex.Lock()
	defer d.mutex.Unlock()

	// Send query command and wait approximately for some time
	queryCmd := []byte{SYNC_WORD, SLAVE_ADDR, 0x00, 0x51, 0x00, 0x00, 0x52}
	_, err := serial.Write(deps.Port, queryCmd, false)
	if err != nil {
		return DUMMY_VALUE, err
	}

	// Read pan angle response
	response := make([]byte, 7)
	_, err = serial.Read(deps.Port, response, time.Millisecond*100, true)
	if err != nil {
		return DUMMY_VALUE, err
	}

	// Check if first byte is SYNC_WORD
	if response[0] != SYNC_WORD {
		return DUMMY_VALUE, fmt.Errorf("invalid response, expected SYNC_WORD %d, got %d", SYNC_WORD, response[0])
	}

	// Check response checksum
	if d.getChecksum(response[1:6]) != response[6] {
		return DUMMY_VALUE, fmt.Errorf("checksum mismatch, expected %d, got %d", d.getChecksum(response[:5]), response[5])
	}

	// Calculate pan angle
	pmsb, plsb := response[4], response[5]
	pan := (float64(pmsb)*256 + float64(plsb)) / 100

	// Absolute pan angle with north offset
	currentPan := pan + deps.NorthOffset
	if currentPan > 360 {
		currentPan = currentPan - 360
	}
	if currentPan == 360 {
		currentPan = 0
	}

	return currentPan, nil
}

func (d *PanTiltDriverImpl) getTilt(deps *PanTiltDependency) (float64, error) {
	if deps == nil {
		return DUMMY_VALUE, errors.New("dependency is not provided")
	}

	d.mutex.Lock()
	defer d.mutex.Unlock()

	// Send query command and wait for some time
	queryCmd := []byte{SYNC_WORD, SLAVE_ADDR, 0x00, 0x53, 0x00, 0x00, 0x54}
	_, err := serial.Write(deps.Port, queryCmd, false)
	if err != nil {
		return DUMMY_VALUE, err
	}

	// Read tilt angle response
	response := make([]byte, 7)
	_, err = serial.Read(deps.Port, response, time.Millisecond*100, true)
	if err != nil {
		return DUMMY_VALUE, err
	}

	// Check if first byte is SYNC_WORD
	if response[0] != SYNC_WORD {
		return DUMMY_VALUE, fmt.Errorf("invalid response, expected SYNC_WORD %d, got %d", SYNC_WORD, response[0])
	}

	// Check response checksum
	if d.getChecksum(response[1:6]) != response[6] {
		return DUMMY_VALUE, fmt.Errorf("checksum mismatch, expected %d, got %d", d.getChecksum(response[:5]), response[5])
	}

	// Calculate tilt angle
	tmsb, tlsb := response[4], response[5]
	tdata1, tdata2 := (float64(tmsb)*256)+float64(tlsb), float64(0)
	if tdata1 > 18000 {
		tdata2 = 36000 - tdata1
	} else {
		tdata2 = tdata1
	}

	return (tdata2 / 100), nil
}

func (d *PanTiltDriverImpl) readerDaemon(deps *PanTiltDependency) {
	ticker := time.NewTicker(time.Second)
	defer ticker.Stop()

	for {
		<-ticker.C

		pan, err := d.getPan(deps)
		if err != nil {
			continue
		}

		tilt, err := d.getTilt(deps)
		if err != nil {
			continue
		}

		deps.CurrentPan = pan
		deps.CurrentTilt = tilt
	}
}

func (d *PanTiltDriverImpl) IsAvailable(deps *PanTiltDependency) bool {
	d.mutex.Lock()
	defer d.mutex.Unlock()

	// Send pan query command and wait for some time
	queryCmd := []byte{SLAVE_ADDR, 0x00, 0x51, 0x00, 0x00, 0x52}
	_, err := serial.Write(deps.Port, append([]byte{SYNC_WORD}, queryCmd...), false)
	if err != nil {
		return false
	}
	time.Sleep(time.Millisecond * 100)

	// Read response
	response := make([]byte, 7)
	_, err = serial.Read(deps.Port, response, time.Millisecond*100, false)
	if err != nil {
		return false
	}

	// Check if first byte is SYNC_WORD
	if response[0] != SYNC_WORD {
		return false
	}

	// Check response checksum
	if d.getChecksum(response[1:6]) != response[6] {
		return true
	}

	return true
}

func (d *PanTiltDriverImpl) Reset(deps *PanTiltDependency, sig chan<- bool) error {
	if deps == nil {
		return errors.New("dependency is not provided")
	}

	d.mutex.Lock()
	defer d.mutex.Unlock()

	// Sleep for 300ms before sending reset command
	time.Sleep(time.Millisecond * 300)

	resetCmd := []byte{SLAVE_ADDR, 0x00, 0x0F, 0x00, 0x00}
	checksum := d.getChecksum(resetCmd)
	resetCmd = append(resetCmd, checksum)
	_, err := serial.Write(deps.Port, append([]byte{SYNC_WORD}, resetCmd...), false)
	if err != nil {
		return err
	}

	// Reset action takes approximately 93 seconds
	if sig != nil {
		go func() {
			deps.IsBusy = true
			defer func() {
				deps.IsBusy = false
				sig <- true
			}()

			time.Sleep(93 * time.Second)
		}()
	}

	return nil
}

func (d *PanTiltDriverImpl) Init(deps *PanTiltDependency) error {
	if deps == nil {
		return errors.New("dependency is not provided")
	}

	// Start reader daemon
	deps.CurrentPan = DUMMY_VALUE
	deps.CurrentTilt = DUMMY_VALUE
	go d.readerDaemon(deps)

	return nil
}

func (d *PanTiltDriverImpl) SetPan(deps *PanTiltDependency, newPan float64) error {
	if deps == nil {
		return errors.New("dependency is not provided")
	}

	if newPan > MAX_PAN || newPan < MIN_PAN {
		return fmt.Errorf("pan angle must be between %d and %d degrees", MIN_PAN, MAX_PAN)
	}

	if newPan == 360 {
		newPan = 0
	}

	// Calculate encoded pan with north offset
	newPanWithOffset := newPan
	if deps.NorthOffset != 0 {
		newPanWithOffset = 360 - deps.NorthOffset + newPanWithOffset
	}
	if newPanWithOffset >= 360 {
		newPanWithOffset = math.Mod(newPanWithOffset, 360)
	}

	// Encode pan angle
	encodedPan := int(newPanWithOffset * 100)
	pmsb, plsb := byte(encodedPan>>8), byte(encodedPan&0xFF)

	// Send set command
	setCmd := []byte{SLAVE_ADDR, 0x00, 0x4B, pmsb, plsb}
	checksum := d.getChecksum(setCmd)
	setCmd = append(setCmd, checksum)

	d.mutex.Lock()
	_, err := serial.Write(deps.Port, append([]byte{SYNC_WORD}, setCmd...), false)
	d.mutex.Unlock()
	if err != nil {
		return err
	}

	return nil
}

func (d *PanTiltDriverImpl) SetTilt(deps *PanTiltDependency, newTilt float64) error {
	if deps == nil {
		return errors.New("dependency is not provided")
	}

	if newTilt < MIN_TILT || newTilt > MAX_TILT {
		return fmt.Errorf("tilt angle must be between %d and %d degrees", MIN_TILT, MAX_TILT)
	}

	// Encode tilt angle
	encodedTilt := int(newTilt * 100)
	tmsb, tlsb := byte(encodedTilt>>8), byte(encodedTilt&0xFF)

	// Send set command
	setCmd := []byte{SLAVE_ADDR, 0x00, 0x4D, tmsb, tlsb}
	checksum := d.getChecksum(setCmd)
	setCmd = append(setCmd, checksum)

	d.mutex.Lock()
	_, err := serial.Write(deps.Port, append([]byte{SYNC_WORD}, setCmd...), false)
	d.mutex.Unlock()
	if err != nil {
		return err
	}

	return nil
}
