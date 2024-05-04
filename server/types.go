package server

import "github.com/bclswl0827/openstation/graph"

type Options struct {
	Gzip          int
	CORS          bool
	Debug         bool
	WebPrefix     string
	ApiEndpoint   string
	GraphResolver *graph.Resolver
}
