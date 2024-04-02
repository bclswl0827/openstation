package server

import (
	"github.com/bclswl0827/openstation/app"
	"github.com/gin-gonic/gin"
)

func registerRouterV1(rg *gin.RouterGroup, options *app.ServerOptions) {
	services := []ApiServices{}
	for _, s := range services {
		s.RegisterModule(rg, options)
	}
}
