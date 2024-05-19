package alignment

import (
	"github.com/bclswl0827/openstation/startups"
	"go.uber.org/dig"
)

func (t *AlignmentStartupTask) Provide(container *dig.Container, options *startups.Options) error {
	return nil
}
