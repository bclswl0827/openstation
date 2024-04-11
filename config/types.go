package config

type station struct {
	Name     string `json:"name"`
	Remark   string `json:"remark"`
	Location string `json:"location"`
}

type control struct {
	Device string `json:"device"`
	Baud   int    `json:"baud"`
}

type reference struct {
	Device string `json:"device"`
	Baud   int    `json:"baud"`
}

type monitor struct {
	Device string `json:"device"`
	Baud   int    `json:"baud"`
}

type database struct {
	Engine   string `json:"engine"`
	Host     string `json:"host"`
	Port     int    `json:"port"`
	Username string `json:"username"`
	Password string `json:"password"`
	Database string `json:"database"`
}

type server struct {
	Host  string `json:"host"`
	Port  int    `json:"port"`
	CORS  bool   `json:"cors"`
	Debug bool   `json:"debug"`
}

type tle_settings struct {
	Path string `json:"path"`
	Life int    `json:"life"`
}

type satellite struct {
	TLE tle_settings `json:"tle_settings"`
}

type Config struct {
	Station   station   `json:"station_settings"`
	Control   control   `json:"control_settings"`
	Reference reference `json:"reference_settings"`
	Monitor   monitor   `json:"monitor_settings"`
	Satellite satellite `json:"satellite_settings"`
	Database  database  `json:"database_settings"`
	Server    server    `json:"server_settings"`
}

type Args struct {
	Path    string // Path to config file
	Version bool   // Show version information
}
