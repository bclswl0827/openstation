package main

import (
	"flag"
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/bclswl0827/openstation/cleaners"
	cleaner_database "github.com/bclswl0827/openstation/cleaners/database"
	cleaner_peripherals "github.com/bclswl0827/openstation/cleaners/peripherals"
	"github.com/bclswl0827/openstation/config"
	"github.com/bclswl0827/openstation/drivers/dao"
	"github.com/bclswl0827/openstation/graph"
	"github.com/bclswl0827/openstation/server"
	"github.com/bclswl0827/openstation/services"
	"github.com/bclswl0827/openstation/startups"
	startup_alignment "github.com/bclswl0827/openstation/startups/alignment"
	startup_peripherals "github.com/bclswl0827/openstation/startups/peripherals"
	"github.com/bclswl0827/openstation/utils/logger"
	"github.com/common-nighthawk/go-figure"
	"go.uber.org/dig"
)

func parseCommandLine() (args arguments) {
	flag.StringVar(&args.Path, "config", "./config.json", "Path to config file")
	flag.BoolVar(&args.Version, "version", false, "Print version information")
	flag.Parse()

	if args.Version {
		printVersion()
		os.Exit(0)
	}

	return args
}

func setupLogger(level, path string) {
	var err error
	switch level {
	case "info":
		err = logger.SetLevel(logger.INFO)
	case "warn":
		err = logger.SetLevel(logger.WARN)
	case "error":
		err = logger.SetLevel(logger.ERROR)
	case "fatal":
		err = logger.SetLevel(logger.FATAL)
	default:
		err = logger.SetLevel(logger.INFO)
	}

	if err != nil {
		logger.GetLogger(main).Fatalln(err)
	}

	if len(path) != 0 {
		logger.SetFile(path)
	}
}

func init() {
	t := figure.NewFigure("OpenStation", "standard", true).String()
	fmt.Println(t)
	logger.Initialize()
}

func main() {
	args := parseCommandLine()

	var conf config.Config
	err := conf.Read(args.Path)
	if err != nil {
		logger.GetLogger(main).Fatalln(err)
	}
	err = conf.Validate()
	if err != nil {
		logger.GetLogger(main).Fatalln(err)
	}

	// Setup logger with given configuration
	setupLogger(conf.Logger.Level, conf.Logger.Path)
	logger.GetLogger(main).Info("global configuration has been loaded")

	// Connect to database
	databaseConn, err := dao.Open(
		conf.Database.Host,
		conf.Database.Port,
		conf.Database.Engine,
		conf.Database.Username,
		conf.Database.Password,
		conf.Database.Database,
	)
	if err != nil {
		logger.GetLogger(main).Fatalln(err)
	}
	logger.GetLogger(main).Info("database connection has been established")

	// Migrate database schema
	err = migrate(databaseConn)
	if err != nil {
		logger.GetLogger(main).Fatalln(err)
	}
	logger.GetLogger(main).Info("database schema has been migrated")

	// Create dependency injection container
	depsContainer := dig.New()

	// Setup cleaner tasks for graceful shutdown
	cleanerTasks := []cleaners.CleanerTask{
		&cleaner_peripherals.PeripheralsCleanerTask{},
		&cleaner_database.DatabaseCleanerTask{},
	}
	cleanerOptions := &cleaners.Options{
		Config:     &conf,
		Database:   databaseConn,
		Dependency: depsContainer,
	}
	runCleanerTasks := func() {
		for _, t := range cleanerTasks {
			taskName := t.GetTaskName()
			logger.GetLogger(taskName).Infof("running cleaner task for %s", taskName)
			t.Execute(cleanerOptions)
		}
	}
	defer runCleanerTasks()

	// Setup startup tasks and provide dependencies
	startupTasks := []startups.StartupTask{
		&startup_peripherals.PeripheralsStartupTask{},
		&startup_alignment.AlignmentStartupTask{},
	}
	startupOptions := &startups.Options{
		Config:   &conf,
		Database: databaseConn,
	}
	for _, t := range startupTasks {
		taskName := t.GetTaskName()
		err := t.Provide(depsContainer, startupOptions)
		if err != nil {
			logger.GetLogger(taskName).Errorln(err)
			runCleanerTasks()
			os.Exit(1)
		}
		err = t.Execute(depsContainer, startupOptions)
		if err != nil {
			logger.GetLogger(taskName).Errorln(err)
			runCleanerTasks()
			os.Exit(1)
		}
	}

	// Setup background services
	regServices := []services.Service{}
	serviceOptions := &services.Options{
		Config:     &conf,
		Database:   databaseConn,
		Dependency: depsContainer,
		OsSignal:   make(chan os.Signal, 1),
	}
	for _, s := range regServices {
		go s.Start(serviceOptions)
	}

	// Start HTTP web server
	graphResolver := &graph.Resolver{
		Config:     &conf,
		Database:   databaseConn,
		Dependency: depsContainer,
	}
	go server.Start(
		conf.Server.Host,
		conf.Server.Port,
		&server.Options{
			Gzip:          GZIP_LEVEL,
			WebPrefix:     WEB_PREFIX,
			ApiEndpoint:   API_ENDPOINT,
			CORS:          conf.Server.CORS,
			Debug:         conf.Server.Debug,
			GraphResolver: graphResolver,
		},
	)
	logger.GetLogger(main).Infof("web server is listening on %s:%d", conf.Server.Host, conf.Server.Port)

	// Receive interrupt signals
	signal.Notify(serviceOptions.OsSignal, os.Interrupt, syscall.SIGTERM)
	<-serviceOptions.OsSignal

	// Stop services gracefully
	logger.GetLogger(main).Info("services are shutting down, please wait")
	for _, s := range regServices {
		s.Stop(serviceOptions)
	}
}
