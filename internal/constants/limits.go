package constants

const (
	// MaxMessageSize is the maximum size for a message (10MB)
	MaxMessageSize = 10 << 20 // 10MB

	// MaxFetchCount is the maximum number of messages to fetch at once
	MaxFetchCount = 100

	// DefaultReplicas is the default number of replicas for streams
	DefaultReplicas = 1

	// MaxReplicas is the maximum number of replicas allowed
	MaxReplicas = 5

	// MinReplicas is the minimum number of replicas allowed
	MinReplicas = 1
)

// Storage Types
const (
	StorageFile   = "file"
	StorageMemory = "memory"
)

// Retention Policies
const (
	RetentionLimits    = "limits"
	RetentionInterest  = "interest"
	RetentionWorkQueue = "workqueue"
)

// Ack Policies
const (
	AckPolicyNone     = "none"
	AckPolicyAll      = "all"
	AckPolicyExplicit = "explicit"
)

// Deliver Policies
const (
	DeliverPolicyAll  = "all"
	DeliverPolicyLast = "last"
	DeliverPolicyNew  = "new"
)

// Replay Policies
const (
	ReplayPolicyInstant  = "instant"
	ReplayPolicyOriginal = "original"
)

// PauseSentinel is the MaxDeliver value used to mark a paused consumer.
// -2 is chosen because NATS uses -1 for unlimited and 0 is the Go zero-value default,
// so -2 cannot be confused with either a default or an unlimited consumer.
const PauseSentinel = -2
