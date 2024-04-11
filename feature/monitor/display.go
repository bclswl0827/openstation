package monitor

import (
	"fmt"
	"io"
	"time"

	"github.com/bclswl0827/openstation/driver/monitor"
)

func (d *Monitor) displayStatus(driver monitor.MonitorDriver, port io.ReadWriteCloser) {
	status := monitor.Status{
		Busy: true,
	}
	for {
		currentTime := time.Now().Format("15:04:05")
		screenText := fmt.Sprintf("Current Time:\n%s", currentTime)
		err := driver.Display(port, status, screenText, 0, 0)
		if err != nil {
			d.OnError(nil, err)
			return
		}
	}
}
