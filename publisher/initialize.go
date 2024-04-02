package publisher

import "github.com/bclswl0827/openstation/config"

func Initialize(config *config.Config, status *Status) {
	status.System = &System{}
}
