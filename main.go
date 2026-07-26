//go:build !wails_ignore

package main

import (
	"context"
	"io/fs"
	"log"
	"os"
	"path/filepath"

	"github.com/amir-baghshahy/nats-horizon/desktop"
	"github.com/amir-baghshahy/nats-horizon/internal/server"
	"github.com/amir-baghshahy/nats-horizon/internal/sigfix"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

func main() {
	// Build the EXACT same server that cmd/server runs, with desktop-mode restart disabled.
	engine, cleanup := server.Engine(context.Background(), server.WithoutSyscallRestart())

	appInstance := desktop.NewApp(engine, cleanup)
	frontendDist := resolveFrontendDist()

	// Start the signal handler watchdog before Wails initializes WebKitGTK.
	// WebKit installs its SIGSEGV handler without SA_ONSTACK, which crashes Go.
	// The watchdog continuously re-adds SA_ONSTACK to the handler.
	sigfix.StartWatchdog()

	err := wails.Run(&options.App{
		Title:     "nats-horizon",
		Width:     1280,
		Height:    800,
		MinWidth:  900,
		MinHeight: 600,
		AssetServer: &assetserver.Options{
			Assets:     frontendDist,
			Middleware: appInstance.Middleware,
		},
		OnStartup:  appInstance.StartUp,
		OnShutdown: appInstance.ShutDown,
		Bind: []interface{}{
			appInstance,
		},
	})
	if err != nil {
		log.Fatalf("Error: %v", err)
	}
}

func resolveFrontendDist() fs.FS {
	basePath, err := os.Executable()
	if err == nil {
		basePath = filepath.Dir(basePath)
		assetsPath := filepath.Join(basePath, "web", "dist")
		if _, err := os.Stat(assetsPath); err == nil {
			return os.DirFS(assetsPath)
		}
	}

	return os.DirFS("./web/dist")
}
