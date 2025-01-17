package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"os/signal"
	"sync"
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

	service_ntp_server "github.com/bclswl0827/openstation/services/ntp_server"
	service_tracker "github.com/bclswl0827/openstation/services/tasker"

	startup_alignment "github.com/bclswl0827/openstation/startups/alignment"
	startup_peripherals "github.com/bclswl0827/openstation/startups/peripherals"
	"github.com/bclswl0827/openstation/utils/logger"
	"github.com/common-nighthawk/go-figure"
	"go.uber.org/dig"
)

func parseCommandLine() (args arguments) {
	flag.StringVar(&args.Path, "config", "./config.json", "Path to config file")
	flag.BoolVar(&args.Version, "version", false, "Print version information")
	flag.BoolVar(&args.Mock, "mock", false, "Enable mock mode (without hardware access)")
	flag.Parse()

	if args.Version {
		printVersion()
		os.Exit(0)
	}

	return args
}

func setupLogger(level, dumpPath string) {
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

	if len(dumpPath) != 0 {
		logger.SetFile(dumpPath)
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
	setupLogger(conf.Logger.Level, conf.Logger.Dump)
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

	// Setup context for graceful shutdown
	cancelToken, abortSignal := context.WithCancel(context.Background())

	// Setup cleaner tasks for graceful shutdown
	cleanerTasks := []cleaners.CleanerTask{
		&cleaner_peripherals.PeripheralsCleanerTask{},
		&cleaner_database.DatabaseCleanerTask{},
	}
	cleanerOptions := &cleaners.Options{
		Config:     &conf,
		MockMode:   args.Mock,
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
		Config:      &conf,
		MockMode:    args.Mock,
		Database:    databaseConn,
		CancelToken: cancelToken,
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
	regServices := []services.Service{
		&service_ntp_server.NtpServerService{},
		&service_tracker.TaskerService{},
	}
	serviceOptions := &services.Options{
		Config:      &conf,
		MockMode:    args.Mock,
		Database:    databaseConn,
		Dependency:  depsContainer,
		CancelToken: cancelToken,
	}
	var waitGroup sync.WaitGroup
	for _, s := range regServices {
		waitGroup.Add(1)
		go s.Start(serviceOptions, &waitGroup)
	}

	// Start HTTP web server
	graphResolver := &graph.Resolver{
		Config:     &conf,
		MockMode:   args.Mock,
		Database:   databaseConn,
		Dependency: depsContainer,
	}
	go server.Serve(
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
	osSignal := make(chan os.Signal, 1)
	signal.Notify(osSignal, os.Interrupt, syscall.SIGTERM)
	<-osSignal

	// Stop services gracefully
	logger.GetLogger(main).Info("services are shutting down, please wait")
	abortSignal()
	waitGroup.Wait()
}
