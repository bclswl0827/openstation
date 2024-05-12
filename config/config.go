package config

import (
	"encoding/json"
	"os"

	"github.com/go-playground/validator/v10"
)

func (c *Config) Read(path string) error {
	file, err := os.Open(path)
	if err != nil {
		return err
	}
	defer file.Close()

	decoder := json.NewDecoder(file)
	err = decoder.Decode(&c)
	if err != nil {
		return err
	}

	return nil
}

func (c *Config) Validate() error {
	validate := validator.New(validator.WithRequiredStructEnabled())
	err := validate.Struct(c)

	if err != nil {
		return err
	}

	return nil
}
