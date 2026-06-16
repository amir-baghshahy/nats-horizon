package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	// Server
	ServerPort string
	GinMode    string

	// NATS
	NATSURL string

	// CORS
	CORSAllowedOrigins string

	// Pagination
	DefaultPageSize int
	MaxPageSize     int

	// WebSocket
	WSEnablePing   bool
	WSPingInterval int
}

func Load() (*Config, error) {

	_ = godotenv.Load()

	cfg := &Config{
		// Server
		ServerPort: getEnv("SERVER_PORT", "3000"),
		GinMode:    getEnv("GIN_MODE", "debug"),

		// NATS
		NATSURL: getEnv("NATS_URL", "nats://localhost:4222"),

		// CORS
		CORSAllowedOrigins: getEnv("CORS_ALLOWED_ORIGINS", "*"),

		// Pagination
		DefaultPageSize: getEnvInt("DEFAULT_PAGE_SIZE", 25),
		MaxPageSize:     getEnvInt("MAX_PAGE_SIZE", 100),

		// WebSocket
		WSEnablePing:   getEnvBool("WS_ENABLE_PING", true),
		WSPingInterval: getEnvInt("WS_PING_INTERVAL", 30),
	}

	if cfg.NATSURL == "" {
		return nil, fmt.Errorf("NATS_URL is required")
	}

	return cfg, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return defaultValue
}

func getEnvBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolVal, err := strconv.ParseBool(value); err == nil {
			return boolVal
		}
	}
	return defaultValue
}
