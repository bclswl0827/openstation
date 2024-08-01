package gnss

import (
	"bufio"
	"errors"
	"fmt"
	"math"
	"strconv"
	"strings"
	"time"
)

// Hardware driver to LC02HB(A/C) GNSS module
type GnssDriverImpl struct {
	gga     string
	rmc     string
	pqtmtar string
}

func (r *GnssDriverImpl) parseRMC(isDataValid *bool, latitude, longitude *float64, gnssTime *GnssTime) error {
	if len(r.rmc) == 0 {
		return errors.New("got empty RMC message")
	}

	fields := strings.Split(r.rmc, ",")
	if len(fields) != 14 {
		return errors.New("got invalid RMC message")
	}

	// Get system datetime as base time
	gnssTime.LocalBaseTime = time.Now().UTC()

	// Get GNSS datetime as reference time
	timeStr, dateStr := fields[1], fields[9]
	if len(timeStr) < 6 || len(dateStr) < 6 {
		return errors.New("got invalid RMC message")
	}

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
	gnssTime.ReferenceTime = time.Date(
		2000+year, time.Month(month), day,
		hour, minute, second, millisecond*int(time.Millisecond),
		time.UTC,
	)

	// Get latitude in decimal degrees
	lat, err := strconv.ParseFloat(fields[3], 64)
	if err != nil {
		lat = 0
	}
	latDeg := int(lat / 100)
	latMin := lat - float64(latDeg*100)
	*latitude = float64(latDeg) + latMin/60
	if fields[4] == "S" {
		*latitude = -*latitude
	}

	// Validity flag: A = valid, V = invalid
	*isDataValid = fields[2] == "A"
	if !*isDataValid {
		return nil
	}

	// Get longitude in decimal degrees
	lon, err := strconv.ParseFloat(fields[5], 64)
	if err != nil {
		lon = 0
	}
	lonDeg := int(lon / 100)
	lonMin := lon - float64(lonDeg*100)
	*longitude = float64(lonDeg) + lonMin/60
	if fields[6] == "W" {
		*longitude = -*longitude
	}

	return nil
}

func (r *GnssDriverImpl) parseGGA(satellites *int, elevation *float64) error {
	if len(r.gga) == 0 {
		return errors.New("got empty GGA message")
	}

	fields := strings.Split(r.gga, ",")
	if len(fields) != 15 {
		return errors.New("got invalid GGA message")
	}

	// Get numbers of satellites in use
	sats, err := strconv.Atoi(fields[7])
	if err != nil {
		return err
	}
	*satellites = sats

	// Get elevation in meters
	elev, err := strconv.ParseFloat(fields[9], 64)
	if err != nil {
		elev = 0
	}
	*elevation = elev

	return nil
}

func (r *GnssDriverImpl) parsePQTMTAR(DataQuality *int, trueAzimuth *float64) error {
	if len(r.pqtmtar) == 0 {
		return errors.New("got empty PQTMTAR message")
	}

	fields := strings.Split(r.pqtmtar, ",")
	if len(fields) != 13 {
		return errors.New("got invalid PQTMTAR message")
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

func (e *GnssDriverImpl) extractMessage(text, keyword string) (string, error) {
	scanner := bufio.NewScanner(strings.NewReader(text))
	var lines []string
	for scanner.Scan() {
		lines = append(lines, scanner.Text())
	}

	for i := len(lines) - 1; i >= 0; i-- {
		if strings.Contains(lines[i], keyword) {
			return lines[i], nil
		}
	}

	return "", errors.New("no NMEA message found with the given keyword")
}

func (r *GnssDriverImpl) getMessages(deps *GnssDependency, read_attempts int) error {
	var (
		rmc     string
		gga     string
		pqtmtar string
	)
	for ; read_attempts > 0; read_attempts-- {
		buffer := make([]byte, 1024)
		deps.Transport.Read(buffer, time.Millisecond*500, true)
		lines := string(buffer[:])

		// Try to extract RMC message
		if len(rmc) == 0 {
			line, err := r.extractMessage(lines, "RMC")
			if err == nil && len(line) > 0 {
				// Check if message is valid
				line = strings.ReplaceAll(line, "\r", "")
				line = strings.ReplaceAll(line, "\n", "")
				if r.isMessageValid(line) {
					rmc = line
				}
			}
		}

		// Try to extract GGA message
		if len(gga) == 0 {
			line, err := r.extractMessage(lines, "GGA")
			if err == nil && len(line) > 0 {
				// Check if message is valid
				line = strings.ReplaceAll(line, "\r", "")
				line = strings.ReplaceAll(line, "\n", "")
				if r.isMessageValid(line) {
					gga = line
				}
			}
		}

		// Try to extract PQTMTAR message
		if len(pqtmtar) == 0 {
			line, err := r.extractMessage(lines, "PQTMTAR")
			if err == nil && len(line) > 0 {
				// Check if message is valid
				line = strings.ReplaceAll(line, "\r", "")
				line = strings.ReplaceAll(line, "\n", "")
				if r.isMessageValid(line) {
					pqtmtar = line
				}
			}
		}

		if len(rmc) > 0 && len(gga) > 0 && len(pqtmtar) > 0 {
			break
		}
	}

	if read_attempts == 0 {
		return errors.New("read attempts exhausted")
	}

	r.rmc = rmc
	r.gga = gga
	r.pqtmtar = pqtmtar
	return nil
}

func (r *GnssDriverImpl) readerDaemon(deps *GnssDependency) {
	if deps == nil {
		return
	}

	for {
		err := r.getMessages(deps, math.MaxUint8)
		if err != nil {
			continue
		}

		r.parseRMC(&deps.State.IsDataValid, &deps.State.Latitude, &deps.State.Longitude, deps.State.Time)
		r.parseGGA(&deps.State.Satellites, &deps.State.Elevation)
		r.parsePQTMTAR(&deps.State.DataQuality, &deps.State.TrueAzimuth)
	}
}

func (r *GnssDriverImpl) IsAvailable(deps *GnssDependency) bool {
	err := r.getMessages(deps, math.MaxInt8)
	return err == nil
}

func (r *GnssDriverImpl) Init(deps *GnssDependency) error {
	if deps == nil {
		return errors.New("dependency is not provided")
	}

	deps.State.Time = &GnssTime{}
	go r.readerDaemon(deps)
	return nil
}

func (r *GnssDriverImpl) SetBaseline(deps *GnssDependency, baseline float64) error {
	if baseline < 0.2 || baseline > 1.0 {
		return fmt.Errorf("invalid baseline value: %.3f", baseline)
	}

	command := fmt.Sprintf("$PQTMCFGBLD,W,%.3f", baseline)
	checksum := r.getMessageChecksum(command)
	_, err := deps.Transport.Write([]byte(fmt.Sprintf("%s*%s\r\n", command, checksum)), false)
	if err != nil {
		return err
	}

	// Check if GNSS module accepted the command
	buffer := make([]byte, 128)
	deps.Transport.Read(buffer, time.Millisecond*500, true)
	if !strings.Contains(string(buffer[:]), "$PQTMCFGBLD,OK") {
		return errors.New("failed to set GNSS baseline")
	}

	// To save baseline configuration
	_, err = deps.Transport.Write([]byte("$PQTMSAVEPAR*5A\r\n"), false)
	if err != nil {
		return err
	}

	return nil
}

func (r *GnssDriverImpl) GetBaseline(deps *GnssDependency) (float64, error) {
	_, err := deps.Transport.Write([]byte("$PQTMCFGBLD,R*6E\r\n"), false)
	if err != nil {
		return 0, err
	}

	buffer := make([]byte, 128)
	deps.Transport.Read(buffer, time.Millisecond*500, true)
	lines := strings.Split(string(buffer[:]), "\n")

	for _, line := range lines {
		line = strings.ReplaceAll(line, "\r", "")
		if strings.Contains(line, "$PQTMCFGBLD") {
			if !r.isMessageValid(line) {
				return 0, errors.New("got invalid $PQTMCFGBLD message, checksum mismatch")
			}

			fields := strings.Split(line, ",")
			if len(fields) != 3 {
				return 0, errors.New("got invalid $PQTMCFGBLD message, fields count mismatch")
			}

			baseline, err := strconv.ParseFloat((fields[2][:len(fields[2])-3]), 64)
			return baseline, err
		}
	}

	return 0, errors.New("failed to get GNSS baseline")
}
