package config

type station struct {
	Name     string `json:"name"`
	Remark   string `json:"remark"`
	Location string `json:"location"`
}

type pan_tilt struct {
	Device string `json:"device"`
	Baud   int    `json:"baud"`
}

type reference_calibration struct {
	B0       float64 `json:"b_0" validate:"ne=0"`
	B1       float64 `json:"b_1" validate:"ne=0"`
	B2       float64 `json:"b_2" validate:"ne=0"`
	B3       float64 `json:"b_3" validate:"ne=0"`
	B4       float64 `json:"b_4" validate:"ne=0"`
	B5       float64 `json:"b_5" validate:"ne=0"`
	Offset_X float64 `json:"offset_x"`
	Offset_Y float64 `json:"offset_y"`
	Offset_Z float64 `json:"offset_z"`
}

type reference struct {
	Device      string                `json:"device"`
	Baud        int                   `json:"baud"`
	Calibration reference_calibration `json:"calibration"`
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

type Config struct {
	Station   station   `json:"station_settings"`
	PanTilt   pan_tilt  `json:"pantilt_settings"`
	Reference reference `json:"reference_settings"`
	Monitor   monitor   `json:"monitor_settings"`
	Database  database  `json:"database_settings"`
	Server    server    `json:"server_settings"`
}

type Args struct {
	Path    string // Path to config file
	Version bool   // Show version information
}
