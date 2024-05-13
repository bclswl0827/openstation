package tle

import (
	"errors"
	"strconv"
	"strings"
)

func (t *TLE) isValid() bool {
	line_1, line_2 := t.Line_1, t.Line_2
	if len(line_1) == 0 || len(line_2) == 0 {
		return false
	}

	checksum_1 := 0
	expected_1 := int(line_1[len(line_1)-1] - '0')
	for _, char := range t.Line_1[:len(t.Line_1)-1] {
		if char >= '0' && char <= '9' {
			checksum_1 += int(char - '0')
		} else if char == '-' {
			checksum_1 += 1
		}
	}
	checksum_1 %= 10

	checksum_2 := 0
	expected_2 := int(line_2[len(line_2)-1] - '0')
	for _, char := range t.Line_2[:len(t.Line_2)-1] {
		if char >= '0' && char <= '9' {
			checksum_2 += int(char - '0')
		} else if char == '-' {
			checksum_2 += 1
		}
	}
	checksum_2 %= 10

	return checksum_1 == expected_1 && checksum_2 == expected_2
}

func (t *TLE) Load(tleData string) error {
	lines := strings.Split(tleData, "\n")

	for i := range lines {
		lines[i] = strings.TrimSpace(lines[i])
	}

	if len(lines) != 3 {
		return errors.New("TLE data must have 3 lines, including satellite name, line 1, and line 2")
	}

	t.Name = lines[0]
	t.Line_1 = lines[1]
	t.Line_2 = lines[2]

	if !t.isValid() {
		return errors.New("invalid TLE data, checksums do not match")
	}

	satelliteID, err := strconv.ParseInt(lines[1][2:7], 10, 64)
	if err != nil {
		return err
	}
	t.ID = satelliteID

	return nil
}
