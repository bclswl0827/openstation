package gnss

import (
	"bufio"
	"errors"
	"fmt"
	"math"
	"strconv"
	"strings"
	"time"

	"github.com/bclswl0827/openstation/drivers/serial"
)

// Hardware driver to LC02H GNSS module
type GnssDriverImpl struct {
	rmc     string
	pqtmtar string
}

func (r *GnssDriverImpl) parseRMC(isDataValid *bool, latitude, longitude *float64, gnssTime *GnssTime) error {
	if len(r.rmc) == 0 {
		return errors.New("empty RMC message")
	}

	fields := strings.Split(r.rmc, ",")
	if len(fields) != 14 {
		return errors.New("invalid RMC message")
	}

	// Validity flag: A = valid, V = invalid
	*isDataValid = fields[2] == "A"
	if !*isDataValid {
		return nil
	}

	// Get system datetime as base time
	gnssTime.BaseTime = time.Now().UTC()

	// Get GNSS datetime as reference time
	timeStr, dateStr := fields[1], fields[9]
	day, err := strconv.Atoi(dateStr[0:2])
	if err != nil {
		return err
	}
	month, err := strconv.Atoi(dateStr[2:4])
	if err != nil {
		return err
	}
	year, err := strconv.Atoi(dateStr[4:6])
	if err != nil {
		return err
	}
	hour, err := strconv.Atoi(timeStr[0:2])
	if err != nil {
		return err
	}
	minute, err := strconv.Atoi(timeStr[2:4])
	if err != nil {
		return err
	}
	second, err := strconv.Atoi(timeStr[4:6])
	if err != nil {
		return err
	}
	millisecond, err := strconv.Atoi(timeStr[7:])
	if err != nil {
		return err
	}
	gnssTime.RefTime = time.Date(
		2000+year, time.Month(month), day,
		hour, minute, second, millisecond*int(time.Millisecond),
		time.UTC,
	)

	// Get latitude in decimal degrees
	lat, err := strconv.ParseFloat(fields[3], 64)
	if err != nil {
		return err
	}
	latDeg := int(lat / 100)
	latMin := lat - float64(latDeg*100)
	*latitude = float64(latDeg) + latMin/60
	if fields[4] == "S" {
		*latitude = -*latitude
	}

	// Get longitude in decimal degrees
	lon, err := strconv.ParseFloat(fields[5], 64)
	if err != nil {
		return err
	}
	lonDeg := int(lon / 100)
	lonMin := lon - float64(lonDeg*100)
	*longitude = float64(lonDeg) + lonMin/60
	if fields[6] == "W" {
		*longitude = -*longitude
	}

	return nil
}

func (r *GnssDriverImpl) parsePQTMTAR(DataQuality *int, trueAzimuth *float64) error {
	if len(r.pqtmtar) == 0 {
		return errors.New("empty PQTMTAR message")
	}

	fields := strings.Split(r.pqtmtar, ",")
	if len(fields) != 13 {
		return errors.New("invalid PQTMTAR message")
	}

	// Data quality: 0 = not available, 4 = RTK fixed, 6 = RTK float
	quality, err := strconv.Atoi(fields[3])
	if err != nil {
		return err
	}
	*DataQuality = quality

	if quality == 4 || quality == 6 {
		azimuth, err := strconv.ParseFloat(fields[8], 64)
		if err != nil {
			return err
		}
		*trueAzimuth = azimuth
	}

	return nil
}

func (r *GnssDriverImpl) getMessageChecksum(msg string) string {
	var checksum byte
	for i := 1; i < len(msg); i++ {
		checksum ^= byte(msg[i])
	}

	return fmt.Sprintf("%02X", checksum)
}

func (r *GnssDriverImpl) isMessageValid(msg string) bool {
	starIndex := strings.LastIndex(msg, "*")
	if starIndex == -1 || starIndex+3 != len(msg) {
		return false
	}

	origChecksum, err := strconv.ParseInt(msg[starIndex+1:], 16, 8)
	if err != nil {
		return false
	}

	calcChecksumStr := r.getMessageChecksum(msg[:starIndex])
	calcChecksum, err := strconv.ParseInt(calcChecksumStr, 16, 8)
	if err != nil {
		return false
	}

	return calcChecksum == origChecksum
}

func (r *GnssDriverImpl) getMessages(reader *bufio.Reader, read_attempts int) error {
	var (
		rmc     string
		pqtmtar string
	)
	for ; read_attempts > 0; read_attempts-- {
		line, _ := reader.ReadString('\n')
		if len(line) == 0 {
			continue
		}

		// Strip poential \r and \n characters
		line = strings.ReplaceAll(line, "\r", "")
		line = strings.ReplaceAll(line, "\n", "")

		if !r.isMessageValid(line) {
			continue
		}

		if strings.Contains(line, "RMC") {
			rmc = line
		} else if strings.Contains(line, "PQTMTAR") {
			pqtmtar = line
		}

		if rmc != "" && pqtmtar != "" {
			break
		}
	}

	if read_attempts == 0 {
		return fmt.Errorf("read attempts exhausted")
	}

	r.rmc = rmc
	r.pqtmtar = pqtmtar
	return nil
}

func (r *GnssDriverImpl) GetState(deps *GnssDependency) error {
	if deps == nil {
		return fmt.Errorf("dependency is not provided")
	}

	reader := bufio.NewReader(deps.Port)
	err := r.getMessages(reader, math.MaxUint8)
	if err != nil {
		return err
	}

	err = r.parseRMC(&deps.State.IsDataValid, &deps.State.Latitude, &deps.State.Longitude, &deps.State.Time)
	if err != nil {
		return err
	}

	err = r.parsePQTMTAR(&deps.State.DataQuality, &deps.State.TrueAzimuth)
	if err != nil {
		return err
	}

	return nil
}

func (r *GnssDriverImpl) IsAvailable(deps *GnssDependency) bool {
	_, err := serial.Write(deps.Port, []byte("$PQTMVERNO*58\r\n"))
	if err != nil {
		return false
	}

	reader := bufio.NewReader(deps.Port)
	for i := math.MaxInt8; i > 0; i-- {
		line, _ := reader.ReadString('\n')
		if strings.Contains(line, "PQTMVERNO") {
			return true
		}
	}

	return false
}

func (r *GnssDriverImpl) SetBaseline(deps *GnssDependency, baseline float64) error {
	if baseline < 0.2 || baseline > 1.0 {
		return fmt.Errorf("invalid baseline value: %.3f", baseline)
	}

	command := fmt.Sprintf("$PQTMCFGBLD,W,%.3f", baseline)
	checksum := r.getMessageChecksum(command)
	_, err := serial.Write(
		deps.Port, []byte(fmt.Sprintf("%s*%s\r\n", command, checksum)),
	)
	if err != nil {
		return err
	}

	return nil
}
