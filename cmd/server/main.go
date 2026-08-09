package main

import (
	"context"
	"flag"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/amir-baghshahy/nats-horizon/internal/config"
	"github.com/amir-baghshahy/nats-horizon/internal/constants"
	"github.com/amir-baghshahy/nats-horizon/internal/server"

	"github.com/gin-gonic/gin"
)

//	@title			NATS Horizon API
//	@version		1.0
//	@description	Comprehensive API for monitoring and managing NATS JetStream instances.
//	@termsOfService	http://swagger.io/terms/

//	@contact.name	NATS Horizon Project
//	@contact.url	http://github.com/nats-horizon

//	@license.name	Apache-2.0
//	@license.url	https://opensource.org/licenses/Apache-2.0

//	@BasePath	/api
//	@schemes	http https

func main() {
	// Parse environment variables and command line flags
	portFlag := flag.Int("port", 0, "server port (overrides config file)")
	flag.Parse()

	// Load config from JSON file (persistent settings)
	cfg := config.Get()

	// Validate configuration
	if err := cfg.Validate(); err != nil {
		log.Fatalf("Configuration validation failed: %v", err)
	}

	// Apply port from flag (highest priority)
	if *portFlag > 0 {
		cfg.ServerPort = *portFlag
	} else if port, err := strconv.Atoi(os.Getenv("PORT")); err == nil && port > 0 {
		cfg.ServerPort = port
	}

	// Build the Gin backend (NATS connect, repos, services, handlers, routes).
	// Standalone server keeps the syscall.Exec restart behavior.
	ctx, cancel := context.WithCancel(context.Background())
	r, cleanup := server.Engine(ctx)
	defer cancel()

	// Static file serving is only needed for the standalone HTTP server; the
	// desktop app serves assets itself via the Wails asset server.
	r.Static("/assets", "./web/dist/assets")
	r.NoRoute(func(c *gin.Context) {
		c.File("./web/dist/index.html")
	})

	srv := &http.Server{
		Addr:         net.JoinHostPort(cfg.GetServerBindAddress(), strconv.Itoa(cfg.GetServerPort())),
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	log.Printf("Server starting on http://%s:%d", cfg.GetServerBindAddress(), cfg.GetServerPort())

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), constants.ShutdownTimeout)
	defer shutdownCancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("Server shutdown error: %v", err)
	}

	cleanup()

	log.Println("Server exited")
}
