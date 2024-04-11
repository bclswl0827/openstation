package app

import "github.com/bclswl0827/openstation/feature"

type ServerOptions struct {
	Gzip           int
	CORS           bool
	WebPrefix      string
	APIPrefix      string
	FeatureOptions *feature.Options
}
