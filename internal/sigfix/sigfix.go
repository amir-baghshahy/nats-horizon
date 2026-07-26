//go:build linux && cgo

// Package sigfix works around the WebKitGTK / JavaScriptCore signal handler
// conflict with Go's runtime on Linux.
//
// Problem:
//
//	JavaScriptCore overrides SIGSEGV (signal 11) without setting the SA_ONSTACK
//	flag. Go's runtime requires all signal handlers to run on an alternate
//	signal stack (SA_ONSTACK) because Go goroutines use very small stacks.
//	When SIGSEGV is delivered to a Go-managed thread, the handler runs on the
//	goroutine stack instead of the signal stack, causing Go to abort with:
//
//	  "Fatal error: non-Go code set up signal handler without SA_ONSTACK flag"
//
// Fix:
//
//	We re-install the SIGSEGV handler with SA_ONSTACK added to sa_flags.
//	Because WebKit installs its handler asynchronously (not during init), we
//	provide a goroutine-based watcher that periodically checks and fixes it.
//
// StartWatchdog should be called before wails.Run() to catch the handler as
// soon as WebKit installs it.
package sigfix

/*
#define _GNU_SOURCE
#include <signal.h>
#include <string.h>

// fixSIGSEGVOnStack reads the current SIGSEGV handler and re-installs it
// with SA_ONSTACK added to sa_flags. Returns:
//   1  = handler was updated
//   0  = handler already has SA_ONSTACK or no handler set
//  -1  = error reading/writing sigaction
int fixSIGSEGVOnStack(void) {
	struct sigaction sa;
	memset(&sa, 0, sizeof(sa));

	if (sigaction(SIGSEGV, NULL, &sa) != 0) {
		return -1;
	}

	// If SA_ONSTACK is already set, nothing to do.
	if (sa.sa_flags & SA_ONSTACK) {
		return 0;
	}

	// If there is no handler (SIG_DFL or SIG_IGN), nothing to do.
	if (sa.sa_handler == SIG_DFL || sa.sa_handler == SIG_IGN) {
		return 0;
	}

	sa.sa_flags |= SA_ONSTACK;

	if (sigaction(SIGSEGV, &sa, NULL) != 0) {
		return -1;
	}

	return 1;
}
*/
import "C"

import "time"

func fixSIGSEGVOnStack() bool {
	result := C.fixSIGSEGVOnStack()
	return result == 1
}

// StartWatchdog starts a background goroutine that periodically checks the
// SIGSEGV handler and re-adds SA_ONSTACK if it was removed (e.g. by WebKitGTK
// installing its handler after our first check).
//
// The watchdog runs every 50ms initially and backs off to every 2 seconds
// once it has successfully fixed the handler.
func StartWatchdog() {
	go func() {
		interval := 50 * time.Millisecond
		for {
			if fixSIGSEGVOnStack() {
				// Handler was patched. Back off to periodic re-checks in case
				// WebKit re-installs it (e.g. on secondary webviews).
				interval = 2 * time.Second
			}
			time.Sleep(interval)
		}
	}()
}
