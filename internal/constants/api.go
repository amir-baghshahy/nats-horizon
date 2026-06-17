package constants

import "fmt"

const (
	APIStreamList   = "$JS.API.STREAM.LIST"
	APIStreamInfo   = "$JS.API.STREAM.INFO"
	APIStreamCreate = "$JS.API.STREAM.CREATE"
	APIStreamUpdate = "$JS.API.STREAM.UPDATE"
	APIStreamDelete = "$JS.API.STREAM.DELETE"
	APIStreamPurge  = "$JS.API.STREAM.PURGE"

	APIConsumerList   = "$JS.API.CONSUMER.LIST"
	APIConsumerInfo   = "$JS.API.CONSUMER.INFO"
	APIConsumerCreate = "$JS.API.CONSUMER.CREATE"
	APIConsumerUpdate = "$JS.API.CONSUMER.UPDATE"
	APIConsumerDelete = "$JS.API.CONSUMER.DURABLE.DELETE"

	APIAckPattern = "$JS.ACK.%s.%s.%d"
)

func GetAPIAckSubject(streamName, consumerName string, sequence uint64) string {
	return fmt.Sprintf(APIAckPattern, streamName, consumerName, sequence)
}

// SSE intervals (values are in nanoseconds)
const (
	SSEKeepaliveInterval = 30 * Second
	SSEStatsInterval     = 5 * Second
)
