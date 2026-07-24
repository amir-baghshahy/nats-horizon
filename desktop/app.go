// Package desktop is the Wails desktop entrypoint.
package desktop

import (
	"context"
	"net/http"

	"github.com/amir-baghshahy/nats-horizon/internal/constants"
	"github.com/gin-gonic/gin"
)

// App is the Wails-bound application.
type App struct {
	ctx     context.Context
	engine  *gin.Engine
	cleanup func()
}

// NewApp creates a new desktop App bound to an already-built engine.
func NewApp(engine *gin.Engine, cleanup func()) *App {
	return &App{engine: engine, cleanup: cleanup}
}

// StartUp is the Wails OnStartup hook.
func (a *App) StartUp(ctx context.Context) {
	a.ctx = ctx
}

// ShutDown is the Wails OnShutdown hook.
func (a *App) ShutDown(ctx context.Context) {
	if a.cleanup != nil {
		shutdownCtx, cancel := context.WithTimeout(ctx, constants.ShutdownTimeout)
		defer cancel()
		a.cleanup()
		<-shutdownCtx.Done()
	}
}

// Middleware is a Wails assetserver.Middleware that routes /api/* requests
// to the Gin engine and forwards everything else to the asset handler.
func (a *App) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if len(r.URL.Path) >= 4 && r.URL.Path[:4] == "/api" {
			a.engine.ServeHTTP(w, r)
			return
		}
		next.ServeHTTP(w, r)
	})
}
