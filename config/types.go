package config

type station struct {
	Name     string   `json:"name"`
	Remarks  []string `json:"remarks"`
	Location string   `json:"location"`
}

type pan_tilt struct {
	DSN    string `json:"dsn"`
	Engine string `json:"engine"`
}

type gnss struct {
	DSN      string  `json:"dsn"`
	Engine   string  `json:"engine"`
	Baseline float64 `json:"baseline"`
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

type ntp struct {
	Enable bool `json:"enable"`
	Port   int  `json:"port"`
}

type logger struct {
	Level string `json:"level"`
	Dump  string `json:"dump"`
}

type Config struct {
	Station  station  `json:"station_settings"`
	PanTilt  pan_tilt `json:"pantilt_settings"`
	GNSS     gnss     `json:"gnss_settings"`
	Database database `json:"database_settings"`
	Server   server   `json:"server_settings"`
	NTP      ntp      `json:"ntp_settings"`
	Logger   logger   `json:"logger_settings"`
}
