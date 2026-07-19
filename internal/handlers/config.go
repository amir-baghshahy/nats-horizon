package handlers

import (
	"log"
	"net/http"
	"os"
	"syscall"
	"time"

	"github.com/amir-baghshahy/nats-horizon/internal/config"
	"github.com/amir-baghshahy/nats-horizon/internal/utils/apihttp"
	"github.com/gin-gonic/gin"
)

// ConfigHandler handles configuration endpoints
type ConfigHandler struct{}

// NewConfigHandler creates a new config handler
func NewConfigHandler() *ConfigHandler {
	return &ConfigHandler{}
}

// RestartServer triggers a server restart by re-executing the binary
//
//	@Summary	Restart server
//	@Description	Restarts the server process
//	@Tags		config
//	@Produce	json
//	@Success	200	{object}	map[string]interface{}
//	@Router		/config/restart [post]
func (h *ConfigHandler) RestartServer(c *gin.Context) {
	cfg := config.Get()

	c.JSON(http.StatusOK, gin.H{
		"message":  "Server restart initiated. Please wait...",
		"nats_url": cfg.NATSURL,
	})

	go func() {
		time.Sleep(500 * time.Millisecond)
		exe, err := os.Executable()
		if err != nil {
			log.Printf("Failed to get executable path: %v", err)
			return
		}
		args := os.Args[1:]
		env := os.Environ()
		err = syscall.Exec(exe, append([]string{exe}, args...), env)
		if err != nil {
			log.Printf("Failed to restart server: %v", err)
		}
	}()
}

// GetConfig returns current configuration
//
//	@Summary	Get current configuration
//	@Description	Returns the current server configuration
//	@Tags		config
//	@Produce	json
//	@Success	200	{object}	map[string]interface{}
//	@Router		/config [get]
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
//
//	@Summary	Update configuration
//	@Description	Updates server configuration
//	@Tags		config
//	@Accept		json
//	@Produce	json
//	@Param		request	body		map[string]interface{}	true	"Configuration update request"
//	@Success	200		{object}	map[string]interface{}
//	@Failure	400		{object}	dto.ErrorResponse
//	@Failure	500		{object}	dto.ErrorResponse
//	@Router		/config [put]
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
		apihttp.JSONError(c, http.StatusBadRequest, "Invalid request", err.Error())
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
		apihttp.JSONInternalError(c, err, "failed to save config")
		return
	}

	natsChanged := req.NATSURL != "" && req.NATSURL != oldNATSURL

	c.JSON(http.StatusOK, gin.H{
		"message":      "Configuration saved successfully",
		"nats_changed": natsChanged,
	})
}

// CompleteSetup marks setup as completed
//
//	@Summary	Complete setup
//	@Description	Marks the initial setup as completed
//	@Tags		config
//	@Accept		json
//	@Produce	json
//	@Success	200	{object}	map[string]interface{}
//	@Failure	500	{object}	dto.ErrorResponse
//	@Router		/config/setup/complete [post]
func (h *ConfigHandler) CompleteSetup(c *gin.Context) {
	cfg := config.Get()
	if err := cfg.MarkSetupCompleted(); err != nil {
		apihttp.JSONInternalError(c, err, "failed to save setup status")
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Setup completed"})
}

// CheckSetup returns whether setup is completed
//
//	@Summary	Check setup status
//	@Description	Returns whether the initial setup has been completed
//	@Tags		config
//	@Produce	json
//	@Success	200	{object}	map[string]interface{}
//	@Router		/config/setup [get]
func (h *ConfigHandler) CheckSetup(c *gin.Context) {
	cfg := config.Get()
	c.JSON(http.StatusOK, gin.H{
		"setup_completed": cfg.SetupCompleted,
	})
}
