package main

import (
	"encoding/csv"
	"flag"
	"fmt"
	"os"

	"github.com/bclswl0827/openstation/drivers/pan_tilt"
	"github.com/bclswl0827/openstation/drivers/reference"
	"github.com/bclswl0827/openstation/drivers/serial"
	"github.com/sirupsen/logrus"
)

const PAN_STEP = 1.0

func parseCommandLine(args *arguments) {
	flag.StringVar(&args.pantiltDevice, "pantilt-device", "/dev/ttyUSB0", "Path to pan-tilt device")
	flag.IntVar(&args.pantiltBaudrate, "pantilt-baudurate", 9600, "Baudrate for pan-tilt device")
	flag.StringVar(&args.referenceDevice, "reference-device", "/dev/ttyUSB1", "Path to reference device")
	flag.IntVar(&args.referenceBaudrate, "reference-baudrate", 9600, "Baudrate for reference device")
	flag.StringVar(&args.csvResultPath, "csv-result-path", "./result.csv", "Path to save the result")
	flag.Parse()
}

func saveToCSV(path string, records []magRecord) error {
	file, err := os.Create(path)
	if err != nil {
		return err
	}
	defer file.Close()

	writer := csv.NewWriter(file)
	defer writer.Flush()

	for _, record := range records {
		err := writer.Write([]string{
			fmt.Sprintf("%f", record.x),
			fmt.Sprintf("%f", record.y),
			fmt.Sprintf("%f", record.z),
		})
		if err != nil {
			return err
		}
	}

	return nil
}

func main() {
	var args arguments
	parseCommandLine(&args)

	// Open the pan-tilt device
	ptport, err := serial.Open(args.pantiltDevice, args.pantiltBaudrate)
	if err != nil {
		logrus.Fatalln(err)
	}
	defer serial.Close(ptport)
	pt := pan_tilt.PanTiltDriver(&pan_tilt.PanTiltDriverImpl{})

	// Open the reference device
	refport, err := serial.Open(args.referenceDevice, args.referenceBaudrate)
	if err != nil {
		logrus.Fatalln(err)
	}
	defer serial.Close(refport)
	ref := reference.ReferenceDriver(&reference.ReferenceDriverImpl{})

	// Check if the pan-tilt device is available
	if !pt.IsAvailable(ptport) {
		logrus.Fatalln("pan-tilt device is not available")
	}

	// Reset and initialize pan-tilt device first
	logrus.Info("pan-tilt device is being reset")
	sig := make(chan bool)
	pt.Reset(ptport, sig)
	<-sig

	logrus.Info("pan-tilt device is being initialized")
	err = pt.Init(ptport)
	if err != nil {
		logrus.Fatalln(err)
	}
	logrus.Info("pan-tilt device has been initialized")

	// Get the magnetic field data
	var refState reference.ReferenceState
	go func() {
		for {
			err := ref.GetState(refport, [3]float64{0, 0, 0}, &refState)
			if err != nil {
				logrus.Fatalln(err)
			}
		}
	}()

	// Measure the magnetic field at different pan angles
	magRecords := []magRecord{}
	for i := float64(0); i < 360/PAN_STEP; i++ {
		logrus.Infof("measuring magnetic field at pan angle %.2f\n", i*PAN_STEP)

		// Append the magnetic field data to the records
		magRecords = append(magRecords, magRecord{
			x: refState.MagneticCount[0],
			y: refState.MagneticCount[1],
			z: refState.MagneticCount[2],
		})

		// Rotate the pan
		sig := make(chan bool)
		err := pt.SetPan(ptport, i*PAN_STEP, 0, sig)
		if err != nil {
			logrus.Fatalln(err)
		}
		<-sig
	}

	// Save the records to a CSV file
	err = saveToCSV(args.csvResultPath, magRecords)
	if err != nil {
		logrus.Fatalln(err)
	}
	logrus.Infof("measurement results have been saved to %s\n", args.csvResultPath)
}
