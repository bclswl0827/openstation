package reference

import (
	"bytes"
	"encoding/binary"
	"fmt"
	"io"
	"math"
	"time"
	"unsafe"

	"github.com/bclswl0827/openstation/driver/serial"
	"github.com/westphae/geomag/pkg/egm96"
	"github.com/westphae/geomag/pkg/wmm"
)

type ReferenceBoardDriverImpl struct {
	Timestamp       int64
	Coordinates     [2]float64
	Magnetometer    [3]int16
	MagnetometerASA [3]int8
	States          [2]uint8
}

func (r *ReferenceBoardDriverImpl) isChecksumValid() error {
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

func (r *ReferenceBoardDriverImpl) GetReferenceStatus(port io.ReadWriteCloser, status *ReferenceStatus) error {
	SYNC_WORD := []byte{0x1F, 0x2E}
	err := serial.Filter(port, SYNC_WORD, math.MaxUint8)
	if err != nil {
		return err
	}

	buffer := make([]byte, unsafe.Sizeof(ReferenceBoardDriverImpl{}))
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

	status.IsRTCValid, status.IsGNSSValid = r.States[0]&0x01 == 1, r.States[0]>>1 == 1
	status.Timestamp, status.Latitude, status.Longitude, status.Altitude = r.Timestamp, float64(r.Coordinates[0]), float64(r.Coordinates[1]), float64(0)

	mag_asa_x, mag_asa_y := r.MagnetometerASA[0], r.MagnetometerASA[1]
	mag_raw_x, mag_raw_y := float64(r.Magnetometer[0]), float64(r.Magnetometer[1])
	if mag_asa_x != 0 {
		mag_raw_x *= ((float64(mag_asa_x) / 128) + 1)
	}
	if mag_asa_y != 0 {
		mag_raw_y *= ((float64(mag_asa_y) / 128) + 1)
	}
	mag_density_factor := 4912.0 / 8190.0
	mag_x, mag_y := mag_raw_x*mag_density_factor, mag_raw_y*mag_density_factor
	heading := math.Atan2(mag_x, mag_y) * 180 / math.Pi
	if heading < 0 {
		heading *= -1
		heading = 180 - heading
	}

	declination := float64(0)
	if status.IsGNSSValid {
		timeObj := time.UnixMilli(status.Timestamp)
		location := egm96.NewLocationGeodetic(status.Latitude, status.Longitude, status.Altitude)
		decimalYear := float64(timeObj.Year()) + float64(timeObj.Month())/10
		epochYear := wmm.DecimalYear(decimalYear).ToTime()
		mag, _ := wmm.CalculateWMMMagneticField(location, epochYear)
		declination = mag.D()
	}

	trueAzimuth := heading + declination
	status.IsTrueNorth = trueAzimuth == 0

	return nil
}
