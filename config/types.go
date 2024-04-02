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

type sensor struct {
	Device string `json:"device"`
	Baud   int    `json:"baud"`
}

type display struct {
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

type oribit struct {
	Path string `json:"path"`
	Life int    `json:"life"`
}

type Config struct {
	Station  station  `json:"station_settings"`
	Control  control  `json:"control_settings"`
	Sensor   sensor   `json:"sensor_settings"`
	Display  display  `json:"adc_display"`
	Oribit   oribit   `json:"oribit_settings"`
	Database database `json:"database_settings"`
	Server   server   `json:"server_settings"`
}

type Args struct {
	Path    string // Path to config file
	Version bool   // Show version information
}
