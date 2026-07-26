//go:build !linux || !cgo

package sigfix

// StartWatchdog is a no-op on non-Linux or non-cgo builds.
func StartWatchdog() {
}
