package constants

const (
	MaxMessageSize = 10 << 20 // 10MB

	MaxFetchCount = 100

	DefaultReplicas = 1

	MaxReplicas = 5

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

// DefaultMaxDeliver is the default MaxDeliver value used when resuming a consumer.
// This matches NATS's default behavior for consumers.
const DefaultMaxDeliver = -1
