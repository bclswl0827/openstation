.PHONY: gen

gen:
	@echo "Getting and installing gqlgen..."
	@go get github.com/99designs/gqlgen
	@go install github.com/99designs/gqlgen
	@echo "Generating graphQL files..."
	@gqlgen generate
