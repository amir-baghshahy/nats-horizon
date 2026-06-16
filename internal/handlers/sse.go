package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/nats-io/nats.go"
)

// SSEEvent represents a Server-Sent Event
type SSEEvent struct {
	Type      string      `json:"type"`
	Timestamp int64       `json:"timestamp"`
	Data      interface{} `json:"data"`
}

// SSEClient represents a connected SSE client
type SSEClient struct {
	ID      string
	Channel string
	Writer  http.ResponseWriter
	Flusher http.Flusher
}

// SSEHub manages SSE client connections
type SSEHub struct {
	clients map[string]*SSEClient
	mu      sync.RWMutex
	nc      *nats.Conn
	ctx     context.Context
	cancel  context.CancelFunc
}

type sseStreamListResponse struct {
	Streams []struct {
		Config struct {
			Name string `json:"name"`
		} `json:"config"`
		State struct {
			Messages  uint64 `json:"msgs"`
			Consumers uint64 `json:"consumers"`
		} `json:"state"`
	} `json:"streams"`
}

type sseConsumerListResponse struct {
	Consumers []struct {
		Config struct {
			Name string `json:"name"`
		} `json:"config"`
		State struct {
			NumPending uint64 `json:"num_pending"`
		} `json:"state"`
	} `json:"consumers"`
}

// NewSSEHub creates a new SSE hub
func NewSSEHub(nc *nats.Conn) *SSEHub {
	ctx, cancel := context.WithCancel(context.Background())
	hub := &SSEHub{
		clients: make(map[string]*SSEClient),
		nc:      nc,
		ctx:     ctx,
		cancel:  cancel,
	}
	return hub
}

// AddClient adds a new client to the hub
func (h *SSEHub) AddClient(client *SSEClient) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.clients[client.ID] = client
}

// RemoveClient removes a client from the hub
func (h *SSEHub) RemoveClient(id string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	delete(h.clients, id)
}

// Broadcast sends an event to all clients in a channel
func (h *SSEHub) Broadcast(channel string, event SSEEvent) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	data, err := json.Marshal(event)
	if err != nil {
		log.Printf("Failed to marshal SSE event: %v", err)
		return
	}

	for _, client := range h.clients {
		if client.Channel == channel || client.Channel == "all" {
			select {
			case <-h.ctx.Done():
				return
			default:
				fmt.Fprintf(client.Writer, "data: %s\n\n", data)
				client.Flusher.Flush()
			}
		}
	}
}

// MonitorStreams monitors stream changes and broadcasts updates
func (h *SSEHub) MonitorStreams() {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("monitorStreams panic recovered: %v", r)
		}
	}()

	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	lastCounts := make(map[string]uint64)

	for {
		select {
		case <-h.ctx.Done():
			return
		case <-ticker.C:
			msg, err := h.nc.Request("$JS.API.STREAM.LIST", []byte{}, 2*time.Second)
			if err != nil {
				continue
			}

			var response sseStreamListResponse
			if err := json.Unmarshal(msg.Data, &response); err != nil {
				continue
			}

			for _, stream := range response.Streams {
				name := stream.Config.Name
				msgCount := stream.State.Messages

				// Check if message count changed
				if lastCount, ok := lastCounts[name]; ok && lastCount != msgCount {
					h.Broadcast("streams", SSEEvent{
						Type:      "stream:update",
						Timestamp: time.Now().Unix(),
						Data: gin.H{
							"name":      name,
							"messages":  msgCount,
							"consumers": len(response.Streams),
						},
					})
				}

				lastCounts[name] = msgCount
			}
		}
	}
}

// MonitorConsumers monitors consumer changes and broadcasts updates
func (h *SSEHub) MonitorConsumers() {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("monitorConsumers panic recovered: %v", r)
		}
	}()

	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-h.ctx.Done():
			return
		case <-ticker.C:
			msg, err := h.nc.Request("$JS.API.STREAM.LIST", []byte{}, 2*time.Second)
			if err != nil {
				continue
			}

			var streamResponse sseStreamListResponse
			if err := json.Unmarshal(msg.Data, &streamResponse); err != nil {
				continue
			}

			for _, stream := range streamResponse.Streams {
				streamName := stream.Config.Name
				subject := fmt.Sprintf("$JS.API.CONSUMER.LIST.%s", streamName)
				consumerMsg, err := h.nc.Request(subject, []byte{}, 2*time.Second)
				if err != nil {
					continue
				}

				var consumerResponse sseConsumerListResponse
				if err := json.Unmarshal(consumerMsg.Data, &consumerResponse); err != nil {
					continue
				}

				for _, consumer := range consumerResponse.Consumers {
					h.Broadcast("consumers", SSEEvent{
						Type:      "consumer:update",
						Timestamp: time.Now().Unix(),
						Data: gin.H{
							"name":        consumer.Config.Name,
							"stream":      streamName,
							"lag":         consumer.State.NumPending,
							"num_pending": consumer.State.NumPending,
						},
					})
				}
			}
		}
	}
}

// Close stops the SSE hub
func (h *SSEHub) Close() {
	h.cancel()
}

// HandleSSE handles SSE connections
func (h *SSEHub) HandleSSE(c *gin.Context) {
	// Set SSE headers
	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Writer.Header().Set("Access-Control-Allow-Origin", "*")

	// Get channel from query params
	channel := c.Query("channel")
	if channel == "" {
		channel = "all"
	}

	// Get flusher
	flusher, ok := c.Writer.(http.Flusher)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Streaming not supported"})
		return
	}

	// Generate unique client ID
	clientID := fmt.Sprintf("client-%d", time.Now().UnixNano())

	// Create client
	client := &SSEClient{
		ID:      clientID,
		Channel: channel,
		Writer:  c.Writer,
		Flusher: flusher,
	}

	// Add client to hub
	h.AddClient(client)
	defer h.RemoveClient(clientID)

	// Send initial connection message
	event := SSEEvent{
		Type:      "connected",
		Timestamp: time.Now().Unix(),
		Data: gin.H{
			"message": "SSE connection established",
			"channel": channel,
			"id":      clientID,
		},
	}
	data, _ := json.Marshal(event)
	fmt.Fprintf(c.Writer, "data: %s\n\n", data)
	flusher.Flush()

	// Send keepalive comments
	notify := c.Writer.CloseNotify()
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-notify:
			return
		case <-h.ctx.Done():
			return
		case <-ticker.C:
			fmt.Fprintf(c.Writer, ": keepalive\n\n")
			flusher.Flush()
		}
	}
}

// BroadcastDashboardStats broadcasts current dashboard statistics
func (h *SSEHub) BroadcastDashboardStats() {
	streamCount := 0
	consumerCount := 0
	totalMessages := uint64(0)

	msg, err := h.nc.Request("$JS.API.STREAM.LIST", []byte{}, 2*time.Second)
	if err != nil {
		return
	}

	var response sseStreamListResponse
	if err := json.Unmarshal(msg.Data, &response); err != nil {
		return
	}

	streamCount = len(response.Streams)
	for _, stream := range response.Streams {
		totalMessages += stream.State.Messages
		consumerCount += int(stream.State.Consumers)
	}

	h.Broadcast("dashboard", SSEEvent{
		Type:      "dashboard:update",
		Timestamp: time.Now().Unix(),
		Data: gin.H{
			"streams":   streamCount,
			"consumers": consumerCount,
			"messages":  totalMessages,
		},
	})
}
