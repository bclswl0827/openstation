package ntp_server

import (
	"fmt"
	"net"
)

func (p *NtpServer) getPacket(req []byte) ([]byte, error) {
	currentTime, err := p.timeSource.GetTime()
	if err != nil {
		return nil, err
	}

	fraction := int64(currentTime.Nanosecond()) + FROM_1900_TO_1970
	second := currentTime.Unix() + FROM_1900_TO_1970
	res := make([]byte, 48)
	vn := req[0] & 0x38
	res[0] = vn + 4
	res[1] = 1
	res[2] = req[2]
	res[3] = 0xEC
	res[12] = 0x4E
	res[13] = 0x49
	res[14] = 0x43
	res[15] = 0x54
	copy(res[16:20], intToBytes(second)[0:])
	copy(res[24:32], req[40:48])
	copy(res[32:36], intToBytes(second)[0:])
	copy(res[36:40], intToBytes(fraction)[0:])
	copy(res[40:48], res[32:40])
	return res, nil
}

func (p *NtpServer) OnData(data []byte, addr net.Addr) {
	if isDataValid(data) {
		packet, err := p.getPacket(data)
		if err != nil {
			return
		}

		ip, port, err := splitAddr(addr.String())
		if err != nil {
			return
		}

		laddr, err := net.ResolveUDPAddr("udp", fmt.Sprintf("%s:%d", ip, port))
		if err != nil {
			return
		}

		_, err = p.Conn.WriteTo(packet, laddr)
		if err != nil {
			return
		}
	}
}
