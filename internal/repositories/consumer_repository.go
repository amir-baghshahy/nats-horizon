package repositories

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"github.com/amir-baghshahy/nats-horizon/internal/constants"
	"github.com/amir-baghshahy/nats-horizon/internal/models"
	"github.com/amir-baghshahy/nats-horizon/internal/utils"
	"github.com/amir-baghshahy/nats-horizon/internal/utils/natsutil"
	"github.com/nats-io/nats.go"
)

// NATSConsumerRepository implements ConsumerRepository using NATS JetStream
type NATSConsumerRepository struct {
	nc *nats.Conn
	js nats.JetStreamContext

	pausedConsumers map[string]struct{}
	mu              sync.RWMutex
}

// NewNATSConsumerRepository creates a new NATS consumer repository
func NewNATSConsumerRepository(nc *nats.Conn, js nats.JetStreamContext) *NATSConsumerRepository {
	return &NATSConsumerRepository{
		nc:              nc,
		js:              js,
		pausedConsumers: make(map[string]struct{}),
	}
}

type consumerListResponse struct {
	Consumers []struct {
		Name   string `json:"name"`
		Config struct {
			Durable       string `json:"durable"`
			AckPolicy     int    `json:"ack_policy"`
			DeliverPolicy int    `json:"deliver_policy"`
			ReplayPolicy  int    `json:"replay_policy"`
			MaxDeliver    int    `json:"max_deliver"`
		} `json:"config"`
		State struct {
			NumPending uint64 `json:"num_pending"`
		} `json:"state"`
	} `json:"consumers"`
	Total  int `json:"total"`
	Offset int `json:"offset"`
	Limit  int `json:"limit"`
}

func (r *NATSConsumerRepository) List(ctx context.Context, streamName string) ([]*models.Consumer, error) {
	subject := fmt.Sprintf("%s.%s", constants.APIConsumerListPaged, streamName)

	var allConsumers consumerListResponse
	offset := 0
	limit := 100

	for {
		reqBody, err := json.Marshal(map[string]int{"offset": offset, "limit": limit})
		if err != nil {
			return nil, fmt.Errorf("failed to marshal consumer list request: %w", err)
		}

		msg, err := natsutil.RequestWithTimeout(ctx, r.nc, subject, reqBody, constants.DefaultRequestTimeout)
		if err != nil {
			return nil, fmt.Errorf("failed to list consumers: %w", err)
		}

		var response consumerListResponse
		if err := json.Unmarshal(msg.Data, &response); err != nil {
			return nil, fmt.Errorf("failed to parse consumer list: %w", err)
		}

		allConsumers.Consumers = append(allConsumers.Consumers, response.Consumers...)
		allConsumers.Total = response.Total

		if offset+len(response.Consumers) >= response.Total {
			break
		}
		offset += len(response.Consumers)
	}

	consumers := make([]*models.Consumer, len(allConsumers.Consumers))
	for i, c := range allConsumers.Consumers {
		key := fmt.Sprintf("%s.%s", streamName, c.Name)
		paused := c.Config.MaxDeliver == constants.PauseSentinel || r.isPaused(key)
		consumers[i] = &models.Consumer{
			Name:          c.Name,
			Stream:        streamName,
			Status:        "active",
			NumPending:    c.State.NumPending,
			Durable:       c.Config.Durable != "",
			AckPolicy:     utils.AckPolicyToString(c.Config.AckPolicy),
			DeliverPolicy: utils.DeliverPolicyToString(c.Config.DeliverPolicy),
			ReplayPolicy:  utils.ReplayPolicyToString(c.Config.ReplayPolicy),
			MaxDeliver:    c.Config.MaxDeliver,
			Paused:        paused,
		}
	}

	return consumers, nil
}

func (r *NATSConsumerRepository) Get(ctx context.Context, streamName, name string) (*models.Consumer, error) {
	info, err := r.js.ConsumerInfo(streamName, name)
	if err != nil {
		return nil, fmt.Errorf("failed to get consumer: %w", err)
	}

	return r.toDomainConsumer(info, streamName), nil
}

func (r *NATSConsumerRepository) Create(ctx context.Context, streamName string, consumer *models.Consumer) (*models.Consumer, error) {
	cfg := r.toNATSConsumerConfig(consumer)

	info, err := r.js.AddConsumer(streamName, cfg)
	if err != nil {
		return nil, fmt.Errorf("failed to create consumer: %w", err)
	}

	return r.toDomainConsumer(info, streamName), nil
}

func (r *NATSConsumerRepository) Update(ctx context.Context, streamName string, consumer *models.Consumer) (*models.Consumer, error) {
	cfg := r.toNATSConsumerConfig(consumer)

	info, err := r.js.UpdateConsumer(streamName, cfg)
	if err != nil {
		return nil, fmt.Errorf("failed to update consumer: %w", err)
	}

	return r.toDomainConsumer(info, streamName), nil
}

func (r *NATSConsumerRepository) Delete(ctx context.Context, streamName, name string) error {
	if err := r.js.DeleteConsumer(streamName, name); err != nil {
		return fmt.Errorf("failed to delete consumer: %w", err)
	}
	r.mu.Lock()
	delete(r.pausedConsumers, fmt.Sprintf("%s.%s", streamName, name))
	r.mu.Unlock()
	return nil
}

func (r *NATSConsumerRepository) ResetLag(ctx context.Context, req *models.LagResetRequest) error {
	info, err := r.js.ConsumerInfo(req.StreamName, req.ConsumerName)
	if err != nil {
		return fmt.Errorf("failed to get consumer info: %w", err)
	}

	originalConfig := info.Config

	if err := r.js.DeleteConsumer(req.StreamName, req.ConsumerName); err != nil {
		return fmt.Errorf("failed to delete consumer: %w", err)
	}

	info.Config.DeliverPolicy = nats.DeliverByStartSequencePolicy
	if req.Sequence > 0 {
		info.Config.OptStartSeq = req.Sequence
	} else {
		streamInfo, err := r.js.StreamInfo(req.StreamName)
		if err != nil {
			return fmt.Errorf("failed to get stream info for reset: %w", err)
		}
		info.Config.OptStartSeq = streamInfo.State.LastSeq + 1
	}

	_, err = r.js.AddConsumer(req.StreamName, &info.Config)
	if err != nil {
		if _, rollbackErr := r.js.AddConsumer(req.StreamName, &originalConfig); rollbackErr != nil {
			return fmt.Errorf("failed to recreate consumer: %w (rollback also failed: %v)", err, rollbackErr)
		}
		return fmt.Errorf("failed to recreate consumer: %w", err)
	}

	return nil
}

func (r *NATSConsumerRepository) Replay(ctx context.Context, req *models.ReplayRequest) (string, error) {
	if _, err := r.js.ConsumerInfo(req.StreamName, req.ConsumerName); err != nil {
		return "", fmt.Errorf("consumer not found: %w", err)
	}

	replayID := fmt.Sprintf("replay-%s-%d", req.ConsumerName, time.Now().UnixNano())

	replayCfg := &nats.ConsumerConfig{
		Durable:        replayID,
		DeliverSubject: fmt.Sprintf("replays.%s", replayID),
		AckPolicy:      nats.AckExplicitPolicy,
		DeliverPolicy:  nats.DeliverAllPolicy,
		ReplayPolicy:   nats.ReplayInstantPolicy,
	}

	if req.FilterSubject != "" {
		replayCfg.FilterSubject = req.FilterSubject
	}
	if req.StartSequence > 0 {
		replayCfg.OptStartSeq = req.StartSequence
	}

	_, err := r.js.AddConsumer(req.StreamName, replayCfg)
	if err != nil {
		return "", fmt.Errorf("failed to create replay consumer: %w", err)
	}

	return replayID, nil
}

func (r *NATSConsumerRepository) Pause(ctx context.Context, req *models.PauseRequest) error {
	info, err := r.js.ConsumerInfo(req.StreamName, req.ConsumerName)
	if err != nil {
		return fmt.Errorf("failed to get consumer info: %w", err)
	}

	originalConfig := info.Config

	if err := r.js.DeleteConsumer(req.StreamName, req.ConsumerName); err != nil {
		return fmt.Errorf("failed to delete consumer: %w", err)
	}

	info.Config.MaxDeliver = constants.PauseSentinel

	_, err = r.js.AddConsumer(req.StreamName, &info.Config)
	if err != nil {
		if _, rollbackErr := r.js.AddConsumer(req.StreamName, &originalConfig); rollbackErr != nil {
			return fmt.Errorf("failed to recreate paused consumer: %w (rollback also failed: %v)", err, rollbackErr)
		}
		return fmt.Errorf("failed to recreate paused consumer: %w", err)
	}

	// Verify NATS actually stored the pause sentinel.
	// Older NATS versions silently convert unsupported MaxDeliver values,
	// so we fall back to in-memory tracking when native pause is unavailable.
	verified, err := r.js.ConsumerInfo(req.StreamName, req.ConsumerName)
	if err != nil {
		return fmt.Errorf("failed to verify paused consumer: %w", err)
	}

	key := fmt.Sprintf("%s.%s", req.StreamName, req.ConsumerName)
	if verified.Config.MaxDeliver == constants.PauseSentinel {
		r.mu.Lock()
		delete(r.pausedConsumers, key)
		r.mu.Unlock()
	} else {
		r.mu.Lock()
		r.pausedConsumers[key] = struct{}{}
		r.mu.Unlock()
	}

	return nil
}

func (r *NATSConsumerRepository) Resume(ctx context.Context, req *models.ResumeRequest) error {
	key := fmt.Sprintf("%s.%s", req.StreamName, req.ConsumerName)

	// If we tracked this consumer as paused on an older NATS, resume from tracker.
	r.mu.RLock()
	_, tracked := r.pausedConsumers[key]
	r.mu.RUnlock()

	if tracked {
		r.mu.Lock()
		delete(r.pausedConsumers, key)
		r.mu.Unlock()
		return nil
	}

	info, err := r.js.ConsumerInfo(req.StreamName, req.ConsumerName)
	if err != nil {
		return fmt.Errorf("failed to get consumer info: %w", err)
	}

	if info.Config.MaxDeliver != constants.PauseSentinel {
		return nil
	}

	if err := r.js.DeleteConsumer(req.StreamName, req.ConsumerName); err != nil {
		return fmt.Errorf("failed to delete consumer: %w", err)
	}

	originalConfigForRecovery := info.Config
	info.Config.MaxDeliver = constants.DefaultMaxDeliver

	_, err = r.js.AddConsumer(req.StreamName, &info.Config)
	if err != nil {
		if _, rollbackErr := r.js.AddConsumer(req.StreamName, &originalConfigForRecovery); rollbackErr != nil {
			return fmt.Errorf("failed to recreate resumed consumer: %w (rollback also failed: %v)", err, rollbackErr)
		}
		return fmt.Errorf("failed to recreate resumed consumer: %w", err)
	}

	return nil
}

func (r *NATSConsumerRepository) isPaused(key string) bool {
	r.mu.RLock()
	_, ok := r.pausedConsumers[key]
	r.mu.RUnlock()
	return ok
}

func (r *NATSConsumerRepository) IsPaused(streamName, consumerName string) bool {
	key := fmt.Sprintf("%s.%s", streamName, consumerName)
	return r.isPaused(key)
}

func (r *NATSConsumerRepository) toDomainConsumer(info *nats.ConsumerInfo, streamName string) *models.Consumer {
	key := fmt.Sprintf("%s.%s", streamName, info.Name)
	paused := info.Config.MaxDeliver == constants.PauseSentinel || r.isPaused(key)

	durableName := ""
	if info.Config.Durable != "" {
		durableName = info.Config.Durable
	} else {
		durableName = info.Name
	}

	return &models.Consumer{
		Name:          info.Name,
		Stream:        streamName,
		Status:        "active",
		NumPending:    info.NumPending,
		Durable:       info.Config.Durable != "",
		DurableName:   durableName,
		FilterSubject: info.Config.FilterSubject,
		AckPolicy:     utils.AckPolicyToString(int(info.Config.AckPolicy)),
		DeliverPolicy: utils.DeliverPolicyToString(int(info.Config.DeliverPolicy)),
		ReplayPolicy:  utils.ReplayPolicyToString(int(info.Config.ReplayPolicy)),
		MaxDeliver:    int(info.Config.MaxDeliver),
		Paused:        paused,
	}
}

func (r *NATSConsumerRepository) toNATSConsumerConfig(consumer *models.Consumer) *nats.ConsumerConfig {
	var ackPolicy nats.AckPolicy
	switch consumer.AckPolicy {
	case "none":
		ackPolicy = nats.AckNonePolicy
	default:
		ackPolicy = nats.AckExplicitPolicy
	}

	var deliverPolicy nats.DeliverPolicy
	switch consumer.DeliverPolicy {
	case "last":
		deliverPolicy = nats.DeliverLastPolicy
	case "new":
		deliverPolicy = nats.DeliverNewPolicy
	default:
		deliverPolicy = nats.DeliverAllPolicy
	}

	var replayPolicy nats.ReplayPolicy
	switch consumer.ReplayPolicy {
	case "original":
		replayPolicy = nats.ReplayOriginalPolicy
	default:
		replayPolicy = nats.ReplayInstantPolicy
	}

	durableName := consumer.DurableName
	if durableName == "" {
		durableName = consumer.Name
	}

	return &nats.ConsumerConfig{
		Durable:       durableName,
		AckPolicy:     ackPolicy,
		DeliverPolicy: deliverPolicy,
		ReplayPolicy:  replayPolicy,
		MaxDeliver:    consumer.MaxDeliver,
		FilterSubject: consumer.FilterSubject,
	}
}

// AckMessage acknowledges a message by fetching it from the stream and sending
// the ack to the real reply-to address embedded in the delivered message.
// Constructing the ack subject manually from stream/consumer/seq does not work —
// the real reply-to contains additional fields (delivery count, timestamps, domain).
func (r *NATSConsumerRepository) AckMessage(ctx context.Context, streamName, consumerName string, sequence uint64) error {
	return r.sendAck(ctx, streamName, consumerName, sequence, nil)
}

// NackMessage negative-acknowledges a message so NATS redelivers it.
func (r *NATSConsumerRepository) NackMessage(ctx context.Context, streamName, consumerName string, sequence uint64) error {
	return r.sendAck(ctx, streamName, consumerName, sequence, []byte("-NA"))
}

// TerminateMessage terminates a message so NATS stops redelivering it.
func (r *NATSConsumerRepository) TerminateMessage(ctx context.Context, streamName, consumerName string, sequence uint64) error {
	return r.sendAck(ctx, streamName, consumerName, sequence, []byte("+TERM"))
}

// sendAck fetches the message at sequence from the stream, then publishes payload
// to msg.Reply (the real JetStream ack subject embedded in the delivered message).
func (r *NATSConsumerRepository) sendAck(ctx context.Context, streamName, consumerName string, sequence uint64, payload []byte) error {
	ephemeralCfg := &nats.ConsumerConfig{
		DeliverPolicy: nats.DeliverByStartSequencePolicy,
		OptStartSeq:   sequence,
		AckPolicy:     nats.AckExplicitPolicy,
		MaxDeliver:    1,
	}
	info, err := r.js.AddConsumer(streamName, ephemeralCfg)
	if err != nil {
		return fmt.Errorf("failed to create ephemeral consumer for ack: %w", err)
	}
	defer r.js.DeleteConsumer(streamName, info.Name)

	sub, err := r.js.PullSubscribe("", info.Name, nats.Bind(streamName, info.Name))
	if err != nil {
		return fmt.Errorf("failed to subscribe to ephemeral consumer: %w", err)
	}
	defer sub.Unsubscribe()

	msgs, err := sub.Fetch(1, nats.MaxWait(3*time.Second))
	if err != nil || len(msgs) == 0 {
		return fmt.Errorf("message sequence %d not found in stream %s", sequence, streamName)
	}

	msg := msgs[0]
	if msg.Reply == "" {
		return fmt.Errorf("message has no reply-to address; cannot ack")
	}
	return r.nc.Publish(msg.Reply, payload)
}

// GetPendingMessages returns pending messages for a consumer without affecting
// the consumer's delivery state. It reads messages directly from the stream
// using GetMsg, starting from the consumer's AckFloor sequence.
func (r *NATSConsumerRepository) GetPendingMessages(ctx context.Context, streamName, consumerName string, limit int) ([]*models.Message, error) {
	info, err := r.js.ConsumerInfo(streamName, consumerName)
	if err != nil {
		return nil, fmt.Errorf("failed to get consumer info: %w", err)
	}

	if limit <= 0 || limit > constants.MaxFetchCount {
		limit = constants.MaxFetchCount
	}

	startSeq := info.AckFloor.Stream + 1
	lastSeq := info.NumPending + info.AckFloor.Stream
	if lastSeq < startSeq {
		return []*models.Message{}, nil
	}

	type result struct {
		seq uint64
		msg *models.Message
	}

	const maxWorkers = 8
	seqCh := make(chan uint64, limit)
	resCh := make(chan result, limit)

	for seq := startSeq; seq <= lastSeq && len(resCh) < limit; seq++ {
		seqCh <- seq
	}
	close(seqCh)

	var wg sync.WaitGroup
	workers := maxWorkers
	if int(lastSeq-startSeq+1) < workers {
		workers = int(lastSeq - startSeq + 1)
	}
	for w := 0; w < workers; w++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for seq := range seqCh {
				if ctx.Err() != nil {
					return
				}
				raw, err := r.js.GetMsg(streamName, seq)
				if err != nil {
					continue
				}
				headers := copyHeaders(raw.Header)
				resCh <- result{
					seq: seq,
					msg: &models.Message{
						Subject:   raw.Subject,
						Sequence:  raw.Sequence,
						Data:      raw.Data,
						Headers:   headers,
						Timestamp: raw.Time,
					},
				}
			}
		}()
	}

	go func() {
		wg.Wait()
		close(resCh)
	}()

	resultMap := make(map[uint64]*models.Message, limit)
	for r := range resCh {
		resultMap[r.seq] = r.msg
		if len(resultMap) >= limit {
			break
		}
	}

	if err := ctx.Err(); err != nil {
		return nil, err
	}

	messages := make([]*models.Message, 0, len(resultMap))
	for seq := startSeq; seq <= lastSeq && len(messages) < limit; seq++ {
		if m, ok := resultMap[seq]; ok {
			messages = append(messages, m)
		}
	}

	return messages, nil
}
