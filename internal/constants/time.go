package constants

import "time"

const (
	DefaultRequestTimeout time.Duration = 2 * time.Second
	ShortRequestTimeout   time.Duration = 500 * time.Millisecond
	LongRequestTimeout    time.Duration = 5 * time.Second
	MessageFetchTimeout   time.Duration = 500 * time.Millisecond
	ShutdownTimeout       time.Duration = 5 * time.Second
)
