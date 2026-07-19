package natsutil

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/nats-io/nats.go"
)

const (
	subjectConsumerList = "$JS.API.CONSUMER.LIST"
)

// StreamInfo represents minimal stream info from list responses.
type StreamInfo struct {
	Name      string
	Subjects  []string
	Messages  uint64
	Bytes     uint64
	Consumers int
}

// ConsumerInfo represents minimal consumer info from list responses.
type ConsumerInfo struct {
	Name       string
	Durable    string
	NumPending uint64
}

// ConsumerListResponse is the parsed result of a consumer list request.
type ConsumerListResponse struct {
	Consumers []ConsumerInfo
}

// RequestWithTimeout sends a request with the given timeout, honoring the
// supplied context for cancellation.
func RequestWithTimeout(ctx context.Context, nc *nats.Conn, subject string, payload []byte, timeout time.Duration) (*nats.Msg, error) {
	if nc == nil {
		return nil, fmt.Errorf("nats connection is nil")
	}

	type result struct {
		msg *nats.Msg
		err error
	}

	ch := make(chan result, 1)
	go func() {
		msg, err := nc.Request(subject, payload, timeout)
		ch <- result{msg: msg, err: err}
	}()

	select {
	case <-ctx.Done():
		return nil, fmt.Errorf("request to %s cancelled: %w", subject, ctx.Err())
	case res := <-ch:
		if res.err != nil {
			return nil, fmt.Errorf("request to %s failed: %w", subject, res.err)
		}
		return res.msg, nil
	}
}

func requestJSON(ctx context.Context, nc *nats.Conn, subject string, timeout time.Duration, out interface{}) error {
	msg, err := RequestWithTimeout(ctx, nc, subject, []byte("{}"), timeout)
	if err != nil {
		return err
	}
	if err := json.Unmarshal(msg.Data, out); err != nil {
		return fmt.Errorf("failed to parse response from %s: %w", subject, err)
	}
	return nil
}

// RequestConsumerList sends $JS.API.CONSUMER.LIST.{stream} and parses the response.
func RequestConsumerList(ctx context.Context, nc *nats.Conn, streamName string) (*ConsumerListResponse, error) {
	subject := fmt.Sprintf("%s.%s", subjectConsumerList, streamName)

	var raw struct {
		Consumers []struct {
			Name   string `json:"name"`
			Config struct {
				Durable string `json:"durable"`
			} `json:"config"`
			State struct {
				NumPending uint64 `json:"num_pending"`
			} `json:"state"`
		} `json:"consumers"`
	}

	if err := requestJSON(ctx, nc, subject, 5*time.Second, &raw); err != nil {
		return nil, err
	}

	consumers := make([]ConsumerInfo, 0, len(raw.Consumers))
	for _, c := range raw.Consumers {
		consumers = append(consumers, ConsumerInfo{
			Name:       c.Name,
			Durable:    c.Config.Durable,
			NumPending: c.State.NumPending,
		})
	}

	return &ConsumerListResponse{Consumers: consumers}, nil
}
