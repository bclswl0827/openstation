package server

import (
	"github.com/bclswl0827/openstation/app"
	"github.com/gin-gonic/gin"
)

type ApiServices interface {
	RegisterModule(rg *gin.RouterGroup, options *app.ServerOptions)
}
