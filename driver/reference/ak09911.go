package reference

import (
	"io"
	"math"
)

const RESET_CMD = 0x02

var (
	SYNC_WORD = []byte{0xFC, 0x1B}
	ACK_WORD  = []byte{0xFC, 0x2B}
)

type AK09911DriverImpl struct{}

func (d *AK09911DriverImpl) Init(port io.ReadWriteCloser) error {
	return d.Reset(port)
}

func (d *AK09911DriverImpl) Reset(port io.ReadWriteCloser) error {
	_, err := port.Write([]byte{0x00})
	if err != nil {
		return err
	}

	return nil
}

func (d *AK09911DriverImpl) GetAzimuth(packet *ReferenceSourcePacket, declinotion float64) (float64, error) {
	x, y := float64(packet.Data[0])*0.6, float64(packet.Data[1])*0.6
	theta_radians := math.Atan2(x, y)
	theta_degrees := (theta_radians * 180 / math.Pi) + 180
	if theta_degrees < 0 {
		theta_degrees += 360
	}

	return theta_degrees + declinotion, nil
}
