package main

import (
	"flag"
	"fmt"
	"math"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/bclswl0827/openstation/config"
	"github.com/bclswl0827/openstation/drivers/dao"
	"github.com/bclswl0827/openstation/features"
	"github.com/bclswl0827/openstation/features/monitor"
	"github.com/bclswl0827/openstation/features/pan_tilt"
	"github.com/bclswl0827/openstation/features/reference"
	"github.com/bclswl0827/openstation/graph"
	"github.com/bclswl0827/openstation/server"
	"github.com/common-nighthawk/go-figure"
	"github.com/fatih/color"
	"github.com/sirupsen/logrus"
	messagebus "github.com/vardius/message-bus"
)

func parseCommandLine(conf *config.Config) error {
	var args arguments
	flag.StringVar(&args.Path, "config", "./config.json", "Path to config file")
	flag.BoolVar(&args.Version, "version", false, "Print version information")
	flag.Parse()

	if args.Version {
		printVersion()
		os.Exit(0)
	}

	err := conf.Read(args.Path)
	if err != nil {
		return err
	}

	return conf.Validate()
}

func init() {
	w := color.New(color.FgHiCyan).SprintFunc()
	t := figure.NewFigure("OpenStation", "standard", true).String()
	fmt.Println(w(t))
}

func main() {
	// Read configuration
	var conf config.Config
	err := parseCommandLine(&conf)
	if err != nil {
		logrus.Fatalf("main: %v\n", err)
	} else {
		logrus.Info("main: global configuration has been loaded")
	}

	// Connect to database
	databaseConn, err := dao.Open(
		conf.Database.Host,
		conf.Database.Port,
		conf.Database.Engine,
		conf.Database.Username,
		conf.Database.Password,
		conf.Database.Database,
		30*time.Second,
	)
	if err != nil {
		logrus.Fatalf("main: %v\n", err)
	} else {
		logrus.Info("main: database connection has been established")
	}

	// Migrate database schema
	err = migrate(databaseConn)
	if err != nil {
		logrus.Fatalf("main: %v\n", err)
	} else {
		logrus.Info("main: database schema has been migrated")
	}

	// Initialize system state
	var State features.State
	State.Initialize()

	// Initialize message bus
	messageBus := messagebus.New(math.MaxUint8)
	logrus.Info("main: message bus has been initialized")

	// Register features
	regFeatures := []features.Feature{
		&monitor.Monitor{},
		&pan_tilt.PanTilt{},
		&reference.Reference{},
	}
	featureOptions := features.Options{
		Config:     &conf,
		State:      &State,
		Database:   databaseConn,
		MessageBus: messageBus,
	}
	for _, s := range regFeatures {
		go s.Start(&featureOptions)
	}

	// Start HTTP server
	go server.StartDaemon(
		conf.Server.Host,
		conf.Server.Port,
		&server.Options{
			Gzip:        GZIP_LEVEL,
			WebPrefix:   WEB_PREFIX,
			ApiEndpoint: API_ENDPOINT,
			CORS:        conf.Server.CORS,
			Debug:       conf.Server.Debug,
			GraphResolver: &graph.Resolver{
				Options: featureOptions,
			},
		},
	)
	logrus.Info("main: http server is listening on ", conf.Server.Host, ":", conf.Server.Port)

	// Receive interrupt signals
	signal.Notify(State.SigCh, os.Interrupt, syscall.SIGTERM)
	<-State.SigCh

	// Wait for all features to stop
	logrus.Info("main: daemon is shutting down")
	for _, s := range regFeatures {
		s.Terminate(&featureOptions)
	}
}
