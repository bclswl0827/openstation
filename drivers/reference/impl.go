package reference

import (
	"bytes"
	"encoding/binary"
	"fmt"
	"io"
	"math"
	"time"
	"unsafe"

	"github.com/bclswl0827/openstation/drivers/serial"
	"github.com/westphae/geomag/pkg/egm96"
	"github.com/westphae/geomag/pkg/wmm"
)

type ReferenceDriverImpl struct {
	Timestamp       int64
	Coordinates     [2]float64
	Magnetometer    [3]int16
	MagnetometerASA [3]int8
	States          [2]uint8
}

func (r *ReferenceDriverImpl) isChecksumValid() error {
	calcChecksum := uint8(0)
	for i := 0; i < len(r.Magnetometer); i++ {
		bytes := (*[2]byte)(unsafe.Pointer(&r.Magnetometer[i]))[:]
		for j := 0; j < int(unsafe.Sizeof(int16(0))); j++ {
			calcChecksum ^= bytes[j]
		}
	}

	recvChecksum := r.States[1]
	if recvChecksum != calcChecksum {
		return fmt.Errorf("invalid checksum: expected %d, got %d", calcChecksum, recvChecksum)
	}

	return nil
}

func (r *ReferenceDriverImpl) GetState(port io.ReadWriteCloser, calib [3]float64, state *ReferenceState) error {
	SYNC_WORD := []byte{0x1F, 0x2E}
	err := serial.Filter(port, SYNC_WORD, math.MaxUint8)
	if err != nil {
		return err
	}

	buffer := make([]byte, unsafe.Sizeof(ReferenceDriverImpl{}))
	n, err := serial.Read(port, buffer, 2*time.Second)
	if err != nil {
		return err
	}

	err = binary.Read(bytes.NewReader(buffer[:n]), binary.LittleEndian, r)
	if err != nil {
		return err
	}

	err = r.isChecksumValid()
	if err != nil {
		return err
	}

	state.IsRTCValid, state.IsGNSSValid = r.States[0]&0x01 == 1, r.States[0]>>1 == 1
	state.Timestamp, state.Latitude, state.Longitude = r.Timestamp, float64(r.Coordinates[0]), float64(r.Coordinates[1])

	mag_asa_x, mag_asa_y, mag_asa_z := r.MagnetometerASA[0], r.MagnetometerASA[1], r.MagnetometerASA[2]
	mag_raw_x, mag_raw_y, mag_raw_z := float64(r.Magnetometer[0]), float64(r.Magnetometer[1]), float64(r.Magnetometer[2])
	if mag_asa_x != 0 {
		mag_raw_x *= ((float64(mag_asa_x) / 128) + 1)
	}
	if mag_asa_y != 0 {
		mag_raw_y *= ((float64(mag_asa_y) / 128) + 1)
	}
	if mag_asa_z != 0 {
		mag_raw_z *= ((float64(mag_asa_z) / 128) + 1)
	}

	mag_density_factor := 4912.0 / 8190.0
	mag_x, mag_y, mag_z := mag_raw_x*mag_density_factor, mag_raw_y*mag_density_factor, mag_raw_z*mag_density_factor
	state.MagneticCount[0], state.MagneticCount[1], state.MagneticCount[2] = mag_x, mag_y, mag_z

	// // If the magnetometer calibration is provided, apply it
	// if calib[0] != 0 && calib[1] != 0 && calib[2] != 0 {
	// 	mag_x -= calib[0]
	// 	mag_y -= calib[1]
	// 	mag_z -= calib[2]
	// }

	magAzimuth := math.Atan2(mag_y, mag_x)*180/math.Pi + 360
	magAzimuth = math.Mod(magAzimuth, 360)

	if state.IsGNSSValid {
		timeObj := time.UnixMilli(state.Timestamp)
		location := egm96.NewLocationGeodetic(state.Latitude, state.Longitude, 0)
		decimalYear := float64(timeObj.Year()) + float64(timeObj.Month())/10
		epochYear := wmm.DecimalYear(decimalYear).ToTime()
		mag, _ := wmm.CalculateWMMMagneticField(location, epochYear)
		state.Declination = mag.D()
	}

	state.MagAzimuth = magAzimuth
	return nil
}