package utils

import (
	"fmt"
	"time"

	"github.com/amir-baghshahy/nats-horizon/internal/constants"
	"github.com/amir-baghshahy/nats-horizon/internal/dto"
	"github.com/amir-baghshahy/nats-horizon/internal/models"
)

// StreamToResponse converts a domain Stream to StreamResponse DTO
func StreamToResponse(stream *models.Stream) *dto.StreamResponse {
	if stream == nil {
		return nil
	}

	return &dto.StreamResponse{
		Config: &dto.StreamConfigResponse{
			Name:      stream.Name,
			Subjects:  stream.Subjects,
			Storage:   stream.Storage,
			Retention: stream.Retention,
			Replicas:  stream.Replicas,
			MaxAge:    stream.MaxAge,
			MaxBytes:  uint64(stream.MaxBytes),
		},
		State: &dto.StreamStateResponse{
			Messages:    stream.Messages,
			Bytes:       stream.Bytes,
			Consumers:   stream.Consumers,
			FirstSeq:    stream.FirstSeq,
			LastSeq:     stream.LastSeq,
			FirstTs:     formatTime(stream.FirstTs),
			LastTs:      formatTime(stream.LastTs),
			NumPending:  stream.NumPending,
			DeleteMarks: 0,
		},
	}
}

// StreamsToResponse converts a slice of domain Streams to StreamResponse DTOs
func StreamsToResponse(streams []*models.Stream) []*dto.StreamResponse {
	responses := make([]*dto.StreamResponse, len(streams))
	for i, stream := range streams {
		responses[i] = StreamToResponse(stream)
	}
	return responses
}

// ConsumerToResponse converts a domain Consumer to ConsumerResponse DTO
func ConsumerToResponse(consumer *models.Consumer) *dto.ConsumerResponse {
	if consumer == nil {
		return nil
	}

	durable := GetDurableName(consumer)

	return &dto.ConsumerResponse{
		Name:          consumer.Name,
		Stream:        consumer.Stream,
		Status:        consumer.Status,
		Lag:           consumer.Lag,
		AckRate:       consumer.AckRate,
		NumPending:    consumer.NumPending,
		Paused:        consumer.Paused,
		DurableName:   consumer.DurableName,
		FilterSubject: consumer.FilterSubject,
		Config: &dto.ConsumerConfigResponse{
			Durable:       durable,
			AckPolicy:     consumer.AckPolicy,
			DeliverPolicy: consumer.DeliverPolicy,
			ReplayPolicy:  consumer.ReplayPolicy,
			MaxDeliver:    int64(consumer.MaxDeliver),
		},
	}
}

// ConsumersToResponse converts a slice of domain Consumers to ConsumerResponse DTOs
func ConsumersToResponse(consumers []*models.Consumer) []*dto.ConsumerResponse {
	responses := make([]*dto.ConsumerResponse, len(consumers))
	for i, consumer := range consumers {
		responses[i] = ConsumerToResponse(consumer)
	}
	return responses
}

// GetDurableName returns the durable name for a consumer
func GetDurableName(consumer *models.Consumer) string {
	if consumer == nil || !consumer.Durable {
		return ""
	}
	return consumer.Name
}

// AckPolicyToString converts AckPolicy int to string
func AckPolicyToString(policy int) string {
	switch policy {
	case 0:
		return constants.AckPolicyNone
	case 1:
		return constants.AckPolicyAll
	case 2:
		return constants.AckPolicyExplicit
	default:
		return fmt.Sprintf("%d", policy)
	}
}

// DeliverPolicyToString converts DeliverPolicy int to string
func DeliverPolicyToString(policy int) string {
	switch policy {
	case 0:
		return constants.DeliverPolicyAll
	case 1:
		return constants.DeliverPolicyLast
	case 2:
		return constants.DeliverPolicyNew
	default:
		return fmt.Sprintf("%d", policy)
	}
}

// ReplayPolicyToString converts ReplayPolicy int to string
func ReplayPolicyToString(policy int) string {
	switch policy {
	case 0:
		return constants.ReplayPolicyInstant
	case 1:
		return constants.ReplayPolicyOriginal
	default:
		return fmt.Sprintf("%d", policy)
	}
}

// formatTime converts time.Time to ISO string format
func formatTime(t time.Time) string {
	if t.IsZero() {
		return ""
	}
	return t.UTC().Format(time.RFC3339)
}
