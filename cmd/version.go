package main

import (
	"fmt"
	"runtime"

	"github.com/fatih/color"
)

var (
	release     = "unknown"
	version     = "Custom build"
	description = "Constructing Real-time Seismic Network Ambitiously"
)

func printVersion() {
	version := concat(
		"Observer ", version, " (", description, ")\nRelease: ", version, "-", release, " ",
		runtime.Version(), " ", runtime.GOOS, "/", runtime.GOARCH, "\n",
	)
	w := color.New(color.FgHiCyan).SprintFunc()
	fmt.Println(w(version))
}
