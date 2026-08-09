// Package server builds the reusable Gin HTTP backend shared by the standalone
// server (cmd/server) and the embedded Wails desktop application.
package server

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/amir-baghshahy/nats-horizon/internal/config"
	"github.com/amir-baghshahy/nats-horizon/internal/handlers"
	"github.com/amir-baghshahy/nats-horizon/internal/middleware"
	"github.com/amir-baghshahy/nats-horizon/internal/repositories"
	servicespkg "github.com/amir-baghshahy/nats-horizon/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/nats-io/nats.go"
)

// natsConnection manages the NATS connection used by the server.
type natsConnection struct {
	nc *nats.Conn
	js nats.JetStreamContext
}

func newNATSConnection(url string) (*natsConnection, error) {
	nc, err := nats.Connect(url,
		nats.ReconnectWait(2*time.Second),
		nats.MaxReconnects(10),
		nats.Timeout(5*time.Second),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to NATS: %w", err)
	}

	js, err := nc.JetStream()
	if err != nil {
		nc.Close()
		return nil, fmt.Errorf("failed to create JetStream context: %w", err)
	}

	return &natsConnection{nc: nc, js: js}, nil
}

func (c *natsConnection) Close() {
	if c.nc != nil {
		c.nc.Close()
	}
}

// Option configures Engine behavior.
type Option func(*engineConfig)

type engineConfig struct {
	disableSyscallRestart bool
}

// WithoutSyscallRestart disables the syscall.Exec-based /config/restart handler
// (which would kill an embedded Wails process). The standalone server omits
// this option so it keeps process re-exec; the desktop app passes it.
func WithoutSyscallRestart() Option {
	return func(c *engineConfig) { c.disableSyscallRestart = true }
}

// Engine constructs and returns the fully initialized Gin engine and a cleanup
// function. Both the standalone server and the Wails desktop app use this so
// there is a single, authoritative definition of the backend (NATS wiring,
// handlers, middleware, and route table). The caller owns the returned
// context's lifecycle and must invoke cleanup on shutdown.
func Engine(parent context.Context, opts ...Option) (*gin.Engine, func()) {
	ec := &engineConfig{}
	for _, opt := range opts {
		opt(ec)
	}
	cfg := config.Get()

	if err := cfg.Validate(); err != nil {
		log.Fatalf("Configuration validation failed: %v", err)
	}

	gin.SetMode(cfg.GinMode)

	var conn *natsConnection
	natsAvailable := false
	if cfg.SetupCompleted {
		log.Printf("Connecting to NATS at %s...", cfg.NATSURL)
		c, err := newNATSConnection(cfg.NATSURL)
		if err != nil {
			log.Printf("WARNING: Failed to connect to NATS: %v\n"+
				"The application will start but most features will be unavailable.\n"+
				"Please ensure:\n"+
				"1. NATS server is running and accessible\n"+
				"2. Configuration is correct\n"+
				"You can fix this in Settings after the app loads.", err)
		} else {
			log.Println("Connected to NATS")
			conn = c
			natsAvailable = true
		}
	} else {
		log.Println("Setup not completed. Starting server in setup mode (no NATS connection required).")
	}

	var streamRepo *repositories.NATSStreamRepository
	var consumerRepo *repositories.NATSConsumerRepository
	var messageRepo *repositories.NATSMessageRepository
	var streamUseCase *servicespkg.StreamUseCase
	var consumerUseCase *servicespkg.ConsumerUseCase
	var messageUseCase *servicespkg.MessageUseCase
	var serverUseCase *servicespkg.ServerUseCase
	var streamHandler *handlers.StreamHandler
	var consumerHandler *handlers.ConsumerHandler
	var serverHandler *handlers.ServerHandler
	var coreNATSHandler *handlers.CoreNATShandler
	var kvHandler *handlers.KVHandler
	var clusterHandler *handlers.ClusterHandler
	var alertsHandler *handlers.AlertsHandler
	var metricsHandler *handlers.MetricsHandler
	var exportHandler *handlers.ExportHandler
	var securityHandler *handlers.SecurityHandler
	var sseHub *handlers.SSEHub
	notificationService := servicespkg.NewNotificationService()

	if conn != nil && conn.nc != nil {
		streamRepo = repositories.NewNATSStreamRepository(conn.nc, conn.js)
		consumerRepo = repositories.NewNATSConsumerRepository(conn.nc, conn.js)
		messageRepo = repositories.NewNATSMessageRepository(conn.nc, conn.js)

		streamUseCase = servicespkg.NewStreamUseCase(streamRepo)
		consumerUseCase = servicespkg.NewConsumerUseCase(consumerRepo)
		messageUseCase = servicespkg.NewMessageUseCase(messageRepo)
		serverUseCase = servicespkg.NewServerUseCase(conn.nc, conn.js)

		streamHandler = handlers.NewStreamHandler(streamUseCase)
		consumerHandler = handlers.NewConsumerHandler(consumerUseCase, messageUseCase, conn.nc, conn.js)
		serverHandler = handlers.NewServerHandler(serverUseCase, messageUseCase, streamUseCase)
		coreNATSHandler = handlers.NewCoreNATShandler(conn.nc)
		kvHandler = handlers.NewKVHandler(conn.nc, conn.js)
		clusterHandler = handlers.NewClusterHandler(conn.nc, conn.js)
		alertsHandler = handlers.NewAlertsHandler(conn.nc, conn.js, notificationService)
		metricsHandler = handlers.NewMetricsHandler(conn.nc, conn.js)
		exportHandler = handlers.NewExportHandler(conn.nc, conn.js)
		securityHandler = handlers.NewSecurityHandler(conn.nc, conn.js)

		sseHub = handlers.NewSSEHub(conn.nc)
		go sseHub.MonitorStreams()
		go sseHub.MonitorConsumers()
	}

	// The standalone server re-execs on /config/restart; embedded desktop mode
	// disables it because re-exec would kill the Wails process.
	configHandler := handlers.NewConfigHandler()
	if ec.disableSyscallRestart {
		configHandler.RestartMode = handlers.RestartModeDisabled
	}

	var nc *nats.Conn
	if conn != nil {
		nc = conn.nc
	}
	tenancyHandler := handlers.NewTenancyHandler(cfg.NATSURL, nc)

	r := gin.New()
	r.Use(gin.Logger())
	r.Use(middleware.PanicRecovery())
	r.Use(middleware.SecurityHeaders())
	r.Use(middleware.RequestID())
	r.Use(middleware.LoggingMiddleware())
	r.Use(middleware.RequestSizeLimitMiddleware())
	r.Use(middleware.CORSMiddlewareWithValidation(cfg.CORSAllowedOrigins))
	if !natsAvailable {
		r.Use(func(c *gin.Context) {
			path := c.Request.URL.Path
			if strings.HasPrefix(path, "/api/health") ||
				strings.HasPrefix(path, "/api/config") {
				c.Next()
				return
			}
			c.JSON(http.StatusServiceUnavailable, gin.H{
				"error": "service unavailable: NATS not connected",
			})
			c.Abort()
		})
	}

	apiGroup := r.Group("/api")
	{
		apiGroup.GET("/health", handlers.HealthCheck(serverUseCase))
		apiGroup.GET("/healthz/live", handlers.LivenessCheck())
		apiGroup.GET("/healthz/ready", handlers.ReadinessCheck(serverUseCase))
		apiGroup.GET("/server/info", serverHandler.GetServerInfo)
		apiGroup.GET("/account/info", serverHandler.GetAccountInfo)
		apiGroup.GET("/dashboard/stats", serverHandler.GetDashboardStats)
		apiGroup.GET("/events", sseHub.HandleSSE)

		apiGroup.GET("/consumers/:name", consumerHandler.GetConsumerByName)
		apiGroup.GET("/consumers", consumerHandler.ListAll)

		apiGroup.GET("/connections", serverHandler.GetConnections)
		apiGroup.DELETE("/connections/:id", serverHandler.TerminateConnection)

		// Core NATS Pub/Sub
		apiGroup.POST("/core/publish", coreNATSHandler.PublishMessage)
		apiGroup.POST("/core/request", coreNATSHandler.Request)
		apiGroup.GET("/core/subscribe", coreNATSHandler.Subscribe)
		apiGroup.GET("/core/subscriptions", coreNATSHandler.GetActiveSubscriptions)
		apiGroup.GET("/core/services", coreNATSHandler.GetServiceDiscovery)
		apiGroup.GET("/core/monitor", coreNATSHandler.MonitorTraffic)

		apiGroup.GET("/subjects", serverHandler.GetSubjects)
		apiGroup.GET("/metrics/system", serverHandler.GetSystemMetrics)
		apiGroup.GET("/metrics/rates", serverHandler.GetRateMetrics)

		apiGroup.GET("/messages", serverHandler.GetMessages)
		apiGroup.GET("/messages/page", serverHandler.GetStreamMessagesByPage)

		apiGroup.GET("/streams", streamHandler.ListStreams)
		apiGroup.POST("/streams", streamHandler.CreateStream)

		apiGroup.GET("/streams/:name/consumers/:consumer", consumerHandler.GetConsumer)
		apiGroup.GET("/streams/:name/consumers", consumerHandler.ListConsumers)
		apiGroup.POST("/streams/:name/consumers", consumerHandler.CreateConsumer)
		apiGroup.PUT("/streams/:name/consumers/:consumer", consumerHandler.UpdateConsumer)
		apiGroup.DELETE("/streams/:name/consumers/:consumer", consumerHandler.DeleteConsumer)
		apiGroup.POST("/streams/:name/consumers/:consumer/lag-reset", consumerHandler.ResetLag)
		apiGroup.POST("/streams/:name/consumers/:consumer/replay", consumerHandler.Replay)
		apiGroup.POST("/streams/:name/consumers/:consumer/pause", consumerHandler.Pause)
		apiGroup.POST("/streams/:name/consumers/:consumer/resume", consumerHandler.Resume)

		apiGroup.GET("/streams/:name", streamHandler.GetStream)
		apiGroup.PUT("/streams/:name", streamHandler.UpdateStream)
		apiGroup.DELETE("/streams/:name", streamHandler.DeleteStream)
		apiGroup.POST("/streams/:name/purge", streamHandler.PurgeStream)

		apiGroup.DELETE("/streams/:name/messages/:sequence", consumerHandler.DeleteStreamMessage)
		apiGroup.POST("/streams/:name/messages/publish", consumerHandler.PublishMessage)

		// KV Store routes
		apiGroup.GET("/kv/buckets", kvHandler.ListBuckets)
		apiGroup.POST("/kv/buckets", kvHandler.CreateBucket)
		apiGroup.GET("/kv/buckets/:name", kvHandler.GetBucket)
		apiGroup.DELETE("/kv/buckets/:name", kvHandler.DeleteBucket)
		apiGroup.GET("/kv/buckets/:name/keys", kvHandler.ListKeys)
		apiGroup.GET("/kv/buckets/:name/key", kvHandler.GetKey)
		apiGroup.GET("/kv/buckets/:name/history", kvHandler.GetKeyHistory)
		apiGroup.PUT("/kv/buckets/:name/key", kvHandler.PutKey)
		apiGroup.DELETE("/kv/buckets/:name/key", kvHandler.DeleteKey)
		apiGroup.POST("/kv/buckets/:name/purge", kvHandler.PurgeBucket)

		// Consumer Ack Management routes
		apiGroup.GET("/streams/:name/consumers/:consumer/pending", consumerHandler.GetPendingMessages)
		apiGroup.POST("/streams/:name/consumers/:consumer/ack", consumerHandler.AckMessage)
		apiGroup.POST("/streams/:name/consumers/:consumer/nack", consumerHandler.NackMessage)
		apiGroup.POST("/streams/:name/consumers/:consumer/term", consumerHandler.AckTermMessage)

		// Cluster Monitoring routes
		apiGroup.GET("/cluster/info", clusterHandler.GetClusterInfo)
		apiGroup.GET("/cluster/nodes", clusterHandler.GetClusterNodes)
		apiGroup.GET("/cluster/health", clusterHandler.GetClusterHealth)
		apiGroup.GET("/cluster/streams/:name/replicas", clusterHandler.GetStreamReplicas)

		// Metrics routes
		apiGroup.GET("/metrics", metricsHandler.GetMetrics)
		apiGroup.GET("/metrics/streams/:name", metricsHandler.GetStreamMetrics)
		apiGroup.GET("/metrics/streams/:name/consumers/:consumer", metricsHandler.GetConsumerMetrics)

		// Alerts routes
		apiGroup.GET("/alerts", alertsHandler.ListAlerts)
		apiGroup.POST("/alerts", alertsHandler.CreateAlert)
		apiGroup.GET("/alerts/:id", alertsHandler.GetAlert)
		apiGroup.PUT("/alerts/:id", alertsHandler.UpdateAlert)
		apiGroup.DELETE("/alerts/:id", alertsHandler.DeleteAlert)
		apiGroup.POST("/alerts/check", alertsHandler.CheckAlertsNow)
		apiGroup.GET("/alerts/triggers", alertsHandler.ListTriggers)
		apiGroup.POST("/alerts/triggers/:id/ack", alertsHandler.AckTrigger)

		// Config routes (for setup wizard)
		apiGroup.GET("/config", configHandler.GetConfig)
		apiGroup.PUT("/config", configHandler.UpdateConfig)
		apiGroup.GET("/config/setup", configHandler.CheckSetup)
		apiGroup.POST("/config/setup/complete", configHandler.CompleteSetup)
		apiGroup.POST("/config/restart", configHandler.RestartServer)

		// Export routes
		apiGroup.GET("/export/streams", exportHandler.ExportAllStreams)
		apiGroup.GET("/export/streams/:name", exportHandler.ExportStream)
		apiGroup.POST("/export/streams/:name/messages", exportHandler.ExportMessages)
		apiGroup.GET("/export/streams/:name/consumers/:consumer", exportHandler.ExportConsumer)

		// Security routes
		apiGroup.GET("/security/info", securityHandler.GetSecurityInfo)
		apiGroup.GET("/security/users", securityHandler.GetUsers)
		apiGroup.POST("/security/users", securityHandler.CreateUser)
		apiGroup.PUT("/security/users/:name", securityHandler.UpdateUser)
		apiGroup.DELETE("/security/users/:name", securityHandler.DeleteUser)
		apiGroup.GET("/security/connections", securityHandler.GetConnectionStatus)

		// Tenancy routes
		apiGroup.GET("/tenancy/connections", tenancyHandler.ListConnections)
		apiGroup.POST("/tenancy/connections", tenancyHandler.CreateConnection)
		apiGroup.GET("/tenancy/connections/:id", tenancyHandler.GetConnection)
		apiGroup.PUT("/tenancy/connections/:id", tenancyHandler.UpdateConnection)
		apiGroup.DELETE("/tenancy/connections/:id", tenancyHandler.DeleteConnection)
		apiGroup.POST("/tenancy/connections/test", tenancyHandler.TestConnection)
		apiGroup.PUT("/tenancy/connections/:id/default", tenancyHandler.SetDefaultConnection)
		apiGroup.GET("/tenancy/status", tenancyHandler.GetConnectionStatus)
	}

	cleanup := func() {
		if sseHub != nil {
			sseHub.Close()
		}
		if metricsHandler != nil {
			metricsHandler.Stop()
		}
		if alertsHandler != nil {
			alertsHandler.Stop()
		}
		if conn != nil {
			conn.Close()
		}
	}

	return r, cleanup
}
