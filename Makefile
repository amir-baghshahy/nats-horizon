.PHONY: dev dev-backend dev-frontend build clean test fmt deps openapi docker-build docker-run install-binary

# ── Development ─────────────────────────────────────────────────────────────

dev:
	@echo "Starting backend (:3000) and frontend (:5173)..."
	@make dev-backend & make dev-frontend

dev-backend:
	@echo "Starting backend on :3000..."
	@go run cmd/server/main.go

dev-frontend:
	@echo "Starting frontend on :5173..."
	@cd web && npm run dev

# ── Production ──────────────────────────────────────────────────────────────

build: build-frontend build-backend

build-frontend:
	@echo "Building frontend..."
	@cd web && npm run build

build-backend:
	@echo "Building backend..."
	@go build -o out/server ./cmd/server

run: build-frontend
	@echo "Starting server with built frontend..."
	@go run cmd/server/main.go

# ── Dependencies ─────────────────────────────────────────────────────────────

install:
	@echo "Installing dependencies..."
	@go mod download
	@cd web && npm install

deps:
	@go mod download && go mod tidy

clean:
	@echo "Cleaning..."
	@rm -rf out web/dist web/node_modules

test:
	@echo "Running tests..."
	@go test ./...

fmt:
	@echo "Formatting Go code..."
	@go fmt ./...

openapi:
	@echo "Generating OpenAPI spec..."
	@swag init -g cmd/server/main.go -o api/swagger --parseDependency --parseInternal -ot go,json
	@go run cmd/openapi3gen/main.go
	@rm -f api/swagger/swagger.json api/swagger/swagger.yaml api/swagger/openapi.yaml

# ── Docker ──────────────────────────────────────────────────────────────────

docker-build:
	@echo "Building Docker image..."
	@docker build -t nats-monitoring .

docker-run:
	@echo "Starting with Docker Compose..."
	@docker compose up

docker-run-detached:
	@docker compose up -d

docker-stop:
	@docker compose down

docker-logs:
	@docker compose logs -f

# ── Binary Release ──────────────────────────────────────────────────────────

install-binary:
	@echo "Downloading latest nats-monitoring binary..."
	@bash install.sh
