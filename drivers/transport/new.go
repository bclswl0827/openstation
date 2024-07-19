package transport

import "fmt"

func New(deps *TransportDependency) (TransportDriver, error) {
	engines := map[string]TransportDriver{
		"serial": &TransportDriverSerialImpl{},
		"tcp":    &TransportDriverTcpImpl{},
	}
	engine, ok := engines[deps.Engine]
	if !ok {
		return nil, fmt.Errorf("engine %s is not supported", deps.Engine)
	}

	return engine, nil
}
