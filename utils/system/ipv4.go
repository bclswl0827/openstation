package system

import (
	"net"
)

func GetIPv4Addrs() ([]string, error) {
	addrs, err := net.InterfaceAddrs()
	if err != nil {
		return nil, err
	}

	var ipv4Addresses []string
	for _, addr := range addrs {
		ipNet, ok := addr.(*net.IPNet)
		if !ok || ipNet.IP.IsLoopback() {
			continue
		}
		if ipNet.IP.To4() != nil && ipNet.IP.IsGlobalUnicast() {
			ipv4Addresses = append(ipv4Addresses, ipNet.IP.String())
		}
	}

	return ipv4Addresses, nil
}
