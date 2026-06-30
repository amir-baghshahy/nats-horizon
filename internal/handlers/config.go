package handlers

import (
	"log"
	"net/http"
	"os"
	"syscall"
	"time"

	"github.com/amir-baghshahy/nats-horizon/internal/config"
	"github.com/gin-gonic/gin"
)

// ConfigHandler handles configuration endpoints
type ConfigHandler struct{}

// NewConfigHandler creates a new config handler
func NewConfigHandler() *ConfigHandler {
	return &ConfigHandler{}
}

// RestartServer triggers a server restart by re-executing the binary
func (h *ConfigHandler) RestartServer(c *gin.Context) {
	cfg := config.Get()

	c.JSON(http.StatusOK, gin.H{
		"message":  "Server restart initiated. Please wait...",
		"nats_url": cfg.NATSURL,
	})

	// Restart the server after a short delay to allow response to be sent
	go func() {
		time.Sleep(500 * time.Millisecond)

		// Get the path to the current binary
		exe, err := os.Executable()
		if err != nil {
			log.Printf("Failed to get executable path: %v", err)
			return
		}

		// Prepare the same arguments that were used originally
		args := os.Args[1:]

		// Replace the current process with a new one
		env := os.Environ()

		err = syscall.Exec(exe, append([]string{exe}, args...), env)
		if err != nil {
			log.Printf("Failed to restart server: %v", err)
		}
	}()
}

// GetConfig returns current configuration
func (h *ConfigHandler) GetConfig(c *gin.Context) {
	cfg := config.Get()
	c.JSON(http.StatusOK, gin.H{
		"server_port":          cfg.ServerPort,
		"gin_mode":             cfg.GinMode,
		"nats_url":             cfg.NATSURL,
		"smtp_host":            cfg.SMTPHost,
		"smtp_port":            cfg.SMTPPort,
		"smtp_username":        cfg.SMTPUsername,
		"smtp_from":            cfg.SMTPFrom,
		"cors_allowed_origins": cfg.CORSAllowedOrigins,
		"setup_completed":      cfg.SetupCompleted,
	})
}

// UpdateConfig updates configuration
func (h *ConfigHandler) UpdateConfig(c *gin.Context) {
	var req struct {
		ServerPort         int    `json:"server_port"`
		GinMode            string `json:"gin_mode"`
		NATSURL            string `json:"nats_url"`
		SMTPHost           string `json:"smtp_host"`
		SMTPPort           int    `json:"smtp_port"`
		SMTPUsername       string `json:"smtp_username"`
		SMTPPassword       string `json:"smtp_password"`
		SMTPFrom           string `json:"smtp_from"`
		CORSAllowedOrigins string `json:"cors_allowed_origins"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	cfg := config.Get()

	oldNATSURL := cfg.NATSURL

	if req.ServerPort > 0 {
		cfg.ServerPort = req.ServerPort
	}
	if req.GinMode != "" {
		cfg.GinMode = req.GinMode
	}
	if req.NATSURL != "" {
		cfg.NATSURL = req.NATSURL
	}
	if req.SMTPHost != "" {
		cfg.SMTPHost = req.SMTPHost
	}
	if req.SMTPPort > 0 {
		cfg.SMTPPort = req.SMTPPort
	}
	if req.SMTPUsername != "" {
		cfg.SMTPUsername = req.SMTPUsername
	}
	if req.SMTPPassword != "" {
		cfg.SMTPPassword = req.SMTPPassword
	}
	if req.SMTPFrom != "" {
		cfg.SMTPFrom = req.SMTPFrom
	}
	if req.CORSAllowedOrigins != "" {
		cfg.CORSAllowedOrigins = req.CORSAllowedOrigins
	}

	if err := cfg.Save(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save config"})
		return
	}

	natsChanged := req.NATSURL != "" && req.NATSURL != oldNATSURL

	c.JSON(http.StatusOK, gin.H{
		"message":      "Configuration saved successfully",
		"nats_changed": natsChanged,
		"config": gin.H{
			"server_port": cfg.ServerPort,
			"nats_url":    cfg.NATSURL,
		},
	})
}

// CompleteSetup marks setup as completed
func (h *ConfigHandler) CompleteSetup(c *gin.Context) {
	cfg := config.Get()
	if err := cfg.MarkSetupCompleted(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save setup status"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Setup completed"})
}

// CheckSetup returns whether setup is completed
func (h *ConfigHandler) CheckSetup(c *gin.Context) {
	cfg := config.Get()
	c.JSON(http.StatusOK, gin.H{
		"setup_completed": cfg.SetupCompleted,
	})
}
