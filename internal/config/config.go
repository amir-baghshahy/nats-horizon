package config

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
)

// AppConfig holds all application settings
type AppConfig struct {
	mu sync.RWMutex `json:"-"`

	// Server settings
	ServerPort int    `json:"server_port"`
	GinMode    string `json:"gin_mode"`

	// NATS settings
	NATSURL string `json:"nats_url"`

	// SMTP settings for email alerts
	SMTPHost     string `json:"smtp_host"`
	SMTPPort     int    `json:"smtp_port"`
	SMTPUsername string `json:"smtp_username"`
	SMTPPassword string `json:"smtp_password"`
	SMTPFrom     string `json:"smtp_from"`

	// CORS settings
	CORSAllowedOrigins string `json:"cors_allowed_origins"`

	// First run flag
	SetupCompleted bool `json:"setup_completed"`
}

var (
	instance *AppConfig
	once     sync.Once
)

// Get returns the singleton config instance
func Get() *AppConfig {
	once.Do(func() {
		instance = &AppConfig{
			ServerPort:         3000,
			GinMode:            "release",
			NATSURL:            "nats://localhost:4222",
			SMTPPort:           587,
			CORSAllowedOrigins: "*",
		}
		instance.load()
	})
	return instance
}

// configPath returns the path to the config file
func configPath() string {
	// Use the project directory for config (next to the binary)
	execPath, err := os.Executable()
	if err == nil {
		execDir := filepath.Dir(execPath)
		return filepath.Join(execDir, "nats-horizon.json")
	}

	// Fallback to current directory
	if cwd, err := os.Getwd(); err == nil {
		return filepath.Join(cwd, "nats-horizon.json")
	}

	return "nats-horizon.json"
}

// ensureDir ensures the config directory exists
func ensureDir() error {
	path := filepath.Dir(configPath())
	return os.MkdirAll(path, 0755)
}

// load reads config from file
func (c *AppConfig) load() error {
	path := configPath()
	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			// Config doesn't exist yet, use defaults
			return nil
		}
		return fmt.Errorf("failed to read config: %w", err)
	}

	return json.Unmarshal(data, c)
}

// Save writes config to file
func (c *AppConfig) Save() error {
	c.mu.RLock()
	defer c.mu.RUnlock()

	if err := ensureDir(); err != nil {
		return fmt.Errorf("failed to create config dir: %w", err)
	}

	data, err := json.MarshalIndent(c, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal config: %w", err)
	}

	path := configPath()
	if err := os.WriteFile(path, data, 0600); err != nil {
		return fmt.Errorf("failed to write config: %w", err)
	}

	return nil
}

// Update updates config fields and saves
func (c *AppConfig) Update(updates map[string]interface{}) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	if v, ok := updates["server_port"]; ok {
		if n, ok := toInt(v); ok {
			c.ServerPort = n
		}
	}
	if v, ok := updates["gin_mode"]; ok {
		if s, ok := v.(string); ok {
			c.GinMode = s
		}
	}
	if v, ok := updates["nats_url"]; ok {
		if s, ok := v.(string); ok {
			c.NATSURL = s
		}
	}
	if v, ok := updates["smtp_host"]; ok {
		if s, ok := v.(string); ok {
			c.SMTPHost = s
		}
	}
	if v, ok := updates["smtp_port"]; ok {
		if n, ok := toInt(v); ok {
			c.SMTPPort = n
		}
	}
	if v, ok := updates["smtp_username"]; ok {
		if s, ok := v.(string); ok {
			c.SMTPUsername = s
		}
	}
	if v, ok := updates["smtp_password"]; ok {
		if s, ok := v.(string); ok {
			c.SMTPPassword = s
		}
	}
	if v, ok := updates["smtp_from"]; ok {
		if s, ok := v.(string); ok {
			c.SMTPFrom = s
		}
	}
	if v, ok := updates["cors_allowed_origins"]; ok {
		if s, ok := v.(string); ok {
			c.CORSAllowedOrigins = s
		}
	}

	return c.save()
}

func toInt(v interface{}) (int, bool) {
	switch n := v.(type) {
	case float64:
		return int(n), true
	case int:
		return n, true
	case json.Number:
		i, err := n.Int64()
		if err != nil {
			return 0, false
		}
		return int(i), true
	default:
		return 0, false
	}
}

// save writes config to file (without lock)
func (c *AppConfig) save() error {
	if err := ensureDir(); err != nil {
		return fmt.Errorf("failed to create config dir: %w", err)
	}

	data, err := json.MarshalIndent(c, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal config: %w", err)
	}

	path := configPath()
	return os.WriteFile(path, data, 0600)
}

// GetNATSURL returns the NATS URL
func (c *AppConfig) GetNATSURL() string {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.NATSURL
}

// GetServerPort returns the server port
func (c *AppConfig) GetServerPort() int {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.ServerPort
}

// IsSetupCompleted returns whether setup has been completed
func (c *AppConfig) IsSetupCompleted() bool {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.SetupCompleted
}

// MarkSetupCompleted marks setup as completed
func (c *AppConfig) MarkSetupCompleted() error {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.SetupCompleted = true
	return c.save()
}
