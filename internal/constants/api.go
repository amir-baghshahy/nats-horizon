package constants

const (
	// Stream API subjects
	APIStreamList   = "$JS.API.STREAM.LIST"
	APIStreamInfo   = "$JS.API.STREAM.INFO"
	APIStreamCreate = "$JS.API.STREAM.CREATE"
	APIStreamUpdate = "$JS.API.STREAM.UPDATE"
	APIStreamDelete = "$JS.API.STREAM.DELETE"
	APIStreamPurge  = "$JS.API.STREAM.PURGE"

	// Consumer API subjects
	APIConsumerList   = "$JS.API.CONSUMER.LIST"
	APIConsumerInfo   = "$JS.API.CONSUMER.INFO"
	APIConsumerCreate = "$JS.API.CONSUMER.CREATE"
	APIConsumerUpdate = "$JS.API.CONSUMER.UPDATE"
	APIConsumerDelete = "$JS.API.CONSUMER.DURABLE.DELETE"

	// ACK API subjects pattern
	APIAckPattern = "$JS.ACK.%s.%s.%d" // $JS.ACK.{stream}.{consumer}.{sequence}
)

// GetAPIAckSubject returns the ACK subject for a specific message
func GetAPIAckSubject(streamName, consumerName string, sequence uint64) string {
	return sprintf(APIAckPattern, streamName, consumerName, sequence)
}

func sprintf(_ string, _ ...any) string {
	// Simple implementation, can be replaced with fmt.Sprintf
	return "" // Placeholder - will use fmt.Sprintf in actual code
}

// SSE intervals
const (
	SSEKeepaliveInterval = 30 * Second // 30 seconds
	SSEStatsInterval     = 5 * Second  // 5 seconds
)
