package server

import (
	"fmt"
	"net/http"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/bclswl0827/openstation/frontend"
	"github.com/bclswl0827/openstation/graph"
	"github.com/bclswl0827/openstation/server/middleware/cors"
	"github.com/bclswl0827/openstation/server/middleware/static"
	"github.com/bclswl0827/openstation/server/response"
	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func init() {
	gin.SetMode(gin.ReleaseMode)
}

func StartDaemon(host string, port int, options *Options) error {
	r := gin.New()

	// Setup logger
	r.Use(
		gzip.Gzip(options.Gzip, gzip.WithExcludedPaths([]string{options.ApiEndpoint})),
		gin.LoggerWithWriter(logrus.StandardLogger().Writer()),
	)

	// Setup Cross-Origin Resource Sharing (CORS)
	if options.CORS {
		r.Use(cors.AllowCORS([]cors.HttpHeader{
			{Header: "Access-Control-Allow-Origin", Value: "*"},
			{Header: "Access-Control-Allow-Headers", Value: "Content-Type"},
			{Header: "Access-Control-Expose-Headers", Value: "Content-Length"},
			{Header: "Access-Control-Allow-Methods", Value: "POST, OPTIONS, GET"},
		}))
	}

	// Setup 404 error handler
	r.NoRoute(func(c *gin.Context) {
		response.Error(c, http.StatusNotFound)
	})

	// Setup GraphQL API endpoint
	apiEndpoint := handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{
		Resolvers: options.GraphResolver,
	}))
	r.POST(options.ApiEndpoint, func(ctx *gin.Context) {
		apiEndpoint.ServeHTTP(ctx.Writer, ctx.Request)
	})

	// Setup GraphQL Playground
	if options.Debug {
		r.GET(options.ApiEndpoint, func(ctx *gin.Context) {
			playground.Handler("GraphQL", options.ApiEndpoint).
				ServeHTTP(ctx.Writer, ctx.Request)
		})
	}

	// Setup static file serve
	r.Use(static.ServeEmbed(&static.LocalFileSystem{
		Root: options.WebPrefix, Prefix: options.WebPrefix,
		FileSystem: static.CreateFilesystem(frontend.Dist, "dist"),
	}))

	// Start server
	err := r.Run(fmt.Sprintf("%s:%d", host, port))
	if err != nil {
		logrus.Fatalf("server: %v\n", err)
	}

	return err
}
