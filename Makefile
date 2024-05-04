.PHONY: gen clean build

build:
	@echo "Building the project..."

gen:
	@echo "Getting and installing gqlgen..."
	@go get github.com/99designs/gqlgen
	@go install github.com/99designs/gqlgen
	@gqlgen generate

clean:
	@echo "Cleaning build/dist directory..."
	@rm -rf build/dist/*
