package main

import (
	"fmt"
	"os"
	"os/signal"
	"sync"
	"syscall"

	"github.com/bclswl0827/openstation/app"
	"github.com/bclswl0827/openstation/config"
	"github.com/bclswl0827/openstation/feature"
	"github.com/bclswl0827/openstation/feature/monitor"
	"github.com/bclswl0827/openstation/server"
	"github.com/common-nighthawk/go-figure"
	"github.com/fatih/color"
	"github.com/sirupsen/logrus"
)

func parseCommandLine(conf *config.Config) error {
	var args config.Args
	args.Read()
	if args.Version {
		printVersion()
		os.Exit(0)
	}

	err := conf.Read(args.Path)
	if err != nil {
		return err
	}

	return nil
}

func init() {
	w := color.New(color.FgHiCyan).SprintFunc()
	t := figure.NewFigure("OpenStation", "standard", true).String()
	fmt.Println(w(t))
}

// @BasePath /api/v1
// @title OpenStation RESTful API documentation
// @description This is OpenStation RESTful API documentation, please set `server_settings.debug` to `false` in `config.json` when deploying to production environment in case of any security issues.
func main() {
	// Read configuration
	var conf config.Config
	err := parseCommandLine(&conf)
	if err != nil {
		logrus.Fatalf("main: %v\n", err)
	} else {
		logrus.Info("main: configuration has been loaded")
	}

	// Initialize system status
	var status feature.Status
	status.Init()

	// Register features
	features := []feature.Feature{
		&monitor.Monitor{},
	}
	featureOptions := &feature.Options{
		Config: &conf,
		Status: &status,
	}
	featureWaitGroup := new(sync.WaitGroup)
	for _, s := range features {
		go s.Run(featureOptions, featureWaitGroup)
	}

	// Start HTTP server
	go server.StartDaemon(
		conf.Server.Host,
		conf.Server.Port,
		&app.ServerOptions{
			Gzip:           9,
			WebPrefix:      WEB_PREFIX,
			APIPrefix:      API_PREFIX,
			FeatureOptions: featureOptions,
			CORS:           conf.Server.CORS,
		})

	// Receive interrupt signals
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, os.Interrupt, syscall.SIGTERM)
	<-sigCh

	// Wait for all features to stop
	logrus.Println("main: daemon is shutting down")
	featureWaitGroup.Wait()
}
