package system

import "runtime"

func GetArch() (string, error) {
	return runtime.GOARCH, nil
}
