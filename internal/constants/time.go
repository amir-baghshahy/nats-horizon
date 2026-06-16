package constants

const (
	// DefaultRequestTimeout is the default timeout for NATS requests
	DefaultRequestTimeout = 2 * Second

	// ShortRequestTimeout is used for quick NATS requests
	ShortRequestTimeout = 500 * Millisecond

	// LongRequestTimeout is used for operations that may take longer
	LongRequestTimeout = 5 * Second

	// MessageFetchTimeout is the timeout for fetching messages
	MessageFetchTimeout = 500 * Millisecond

	// ShutdownTimeout is the timeout for graceful server shutdown
	ShutdownTimeout = 5 * Second
)

const (
	// Second represents one second
	Second = 1_000_000_000 // 1 second in nanoseconds

	// Millisecond represents one millisecond
	Millisecond = 1_000_000 // 1 millisecond in nanoseconds
)

var DefaultTimeouts = struct {
	Request      int
	MessageFetch int
	Shutdown     int
}{
	Request:      int(DefaultRequestTimeout / Millisecond),
	MessageFetch: int(MessageFetchTimeout / Millisecond),
	Shutdown:     int(ShutdownTimeout / Second),
}
