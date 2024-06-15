// Code generated by github.com/99designs/gqlgen, DO NOT EDIT.

package model

type Mutation struct {
}

type Query struct {
}

type Forecast struct {
	Duration     float64 `json:"duration"`
	Latitude     float64 `json:"latitude"`
	Longitude    float64 `json:"longitude"`
	MaxElevation float64 `json:"maxElevation"`
	EntryAzimuth float64 `json:"entryAzimuth"`
	ExitAzimuth  float64 `json:"exitAzimuth"`
	StartTime    int64   `json:"startTime"`
	EndTime      int64   `json:"endTime"`
}

type Gnss struct {
	Timestamp   int64   `json:"timestamp"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
	Elevation   float64 `json:"elevation"`
	TrueAzimuth float64 `json:"trueAzimuth"`
	DataQuality int     `json:"dataQuality"`
	Satellites  int     `json:"satellites"`
}

type Observation struct {
	Elevation  float64 `json:"elevation"`
	Azimuth    float64 `json:"azimuth"`
	Observable bool    `json:"observable"`
}

type PanTilt struct {
	CurrentPan  float64 `json:"currentPan"`
	CurrentTilt float64 `json:"currentTilt"`
	NorthOffset float64 `json:"northOffset"`
	IsBusy      bool    `json:"isBusy"`
}

type Station struct {
	Name         string   `json:"name"`
	Remarks      []string `json:"remarks"`
	Location     string   `json:"location"`
	Satellites   int64    `json:"satellites"`
	PendingTasks int64    `json:"pendingTasks"`
	TotalTasks   int64    `json:"totalTasks"`
	ClockOffset  int      `json:"clockOffset"`
}

type System struct {
	Timestamp int64    `json:"timestamp"`
	Uptime    int64    `json:"uptime"`
	CPUUsage  float64  `json:"cpuUsage"`
	MemUsage  float64  `json:"memUsage"`
	DiskUsage float64  `json:"diskUsage"`
	Release   string   `json:"release"`
	Arch      string   `json:"arch"`
	Hostname  string   `json:"hostname"`
	IP        []string `json:"ip"`
}

type Task struct {
	TaskID    int64  `json:"taskId"`
	TleID     int64  `json:"tleId"`
	Name      string `json:"name"`
	StartTime int64  `json:"startTime"`
	EndTime   int64  `json:"endTime"`
	HasDone   bool   `json:"hasDone"`
	Webhook   string `json:"webhook"`
	CreatedAt int64  `json:"createdAt"`
}

type TleData struct {
	ID            int64  `json:"id"`
	Name          string `json:"name"`
	Line1         string `json:"line_1"`
	Line2         string `json:"line_2"`
	EpochTime     int64  `json:"epochTime"`
	CreatedAt     int64  `json:"createdAt"`
	UpdatedAt     int64  `json:"updatedAt"`
	Geostationary bool   `json:"geostationary"`
}
