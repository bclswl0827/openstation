package reference

import (
	"unsafe"
)

func (p *ReferenceSourcePacket) IsChecksumValid() bool {
	checksum := uint8(0)

	for i := 0; i < len(p.Data); i++ {
		bytes := (*[4]byte)(unsafe.Pointer(&p.Data[i]))[:]

		for j := 0; j < int(unsafe.Sizeof(int32(0))); j++ {
			checksum ^= bytes[j]
		}
	}

	return checksum == p.Checksum
}
