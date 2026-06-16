package handlers

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/nats-io/nats.go"
)

// MessageInfo represents a NATS message with metadata
type MessageInfo struct {
	Subject    string              `json:"subject"`
	Data       string              `json:"data"`
	DataBase64 string              `json:"data_base64"`
	Reply      string              `json:"reply,omitempty"`
	Headers    map[string][]string `json:"headers,omitempty"`
	Timestamp  int64               `json:"timestamp"`
	Size       int                 `json:"size"`
}

// CoreNATShandler handles Core NATS (non-JetStream) operations
type CoreNATShandler struct {
	nc *nats.Conn
	mu sync.RWMutex
}

// NewCoreNATShandler creates a new Core NATS handler
func NewCoreNATShandler(nc *nats.Conn) *CoreNATShandler {
	return &CoreNATShandler{
		nc: nc,
	}
}

// PublishMessage publishes a message to a NATS subject
func (h *CoreNATShandler) PublishMessage(c *gin.Context) {
	var req struct {
		Subject string              `json:"subject" binding:"required"`
		Payload string              `json:"payload"`
		Headers map[string][]string `json:"headers"`
		ReplyTo string              `json:"reply_to"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate payload size (max 10MB)
	const maxPayloadSize = 10 << 20
	if len(req.Payload) > maxPayloadSize {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Payload exceeds maximum size of 10MB"})
		return
	}

	msg := &nats.Msg{
		Subject: req.Subject,
		Reply:   req.ReplyTo,
		Data:    []byte(req.Payload),
		Header:  nats.Header(req.Headers),
	}

	err := h.nc.PublishMsg(msg)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Flush to ensure message is sent
	if err := h.nc.Flush(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":   true,
		"subject":   req.Subject,
		"size":      len(req.Payload),
		"timestamp": time.Now().Unix(),
	})
}

// Request sends a request and waits for response
func (h *CoreNATShandler) Request(c *gin.Context) {
	var req struct {
		Subject string              `json:"subject" binding:"required"`
		Payload string              `json:"payload"`
		Headers map[string][]string `json:"headers"`
		Timeout int                 `json:"timeout"` // milliseconds
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if NATS is connected
	if !h.nc.IsConnected() {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "NATS not connected"})
		return
	}

	timeout := 5000 * time.Millisecond
	if req.Timeout > 0 {
		timeout = time.Duration(req.Timeout) * time.Millisecond
	}

	msg := &nats.Msg{
		Subject: req.Subject,
		Data:    []byte(req.Payload),
		Header:  nats.Header(req.Headers),
	}

	// Add inbox for reply
	inbox := nats.NewInbox()
	sub, err := h.nc.SubscribeSync(inbox)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create reply subscription: %v", err)})
		return
	}
	defer sub.Unsubscribe()

	msg.Reply = inbox

	err = h.nc.PublishMsg(msg)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to publish request: %v", err)})
		return
	}

	if err := h.nc.Flush(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to flush connection: %v", err)})
		return
	}

	// Wait for response
	msgResp, err := sub.NextMsg(timeout)
	if err != nil {
		if err == nats.ErrTimeout {
			c.JSON(http.StatusRequestTimeout, gin.H{"error": "Request timeout - no response received"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to receive response: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"subject":     msgResp.Subject,
		"data":        string(msgResp.Data),
		"data_base64": base64.StdEncoding.EncodeToString(msgResp.Data),
		"reply":       msgResp.Reply,
		"headers":     msgResp.Header,
		"timestamp":   time.Now().Unix(),
	})
}

// Subscribe subscribes to a NATS subject with SSE
func (h *CoreNATShandler) Subscribe(c *gin.Context) {
	subject := c.Query("subject")
	if subject == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "subject parameter required"})
		return
	}

	// Set SSE headers
	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Writer.Header().Set("Access-Control-Allow-Origin", "*")

	flusher, ok := c.Writer.(http.Flusher)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Streaming not supported"})
		return
	}

	// Create NATS subscription withMsgHandler := false
	sub, err := h.nc.Subscribe(subject, func(msg *nats.Msg) {
		msgInfo := MessageInfo{
			Subject:    msg.Subject,
			Data:       string(msg.Data),
			DataBase64: base64.StdEncoding.EncodeToString(msg.Data),
			Reply:      msg.Reply,
			Headers:    map[string][]string(msg.Header),
			Timestamp:  time.Now().Unix(),
			Size:       len(msg.Data),
		}

		// Convert to SSE format
		data, _ := json.Marshal(msgInfo)
		c.Writer.Write([]byte("data: " + string(data) + "\n\n"))
		flusher.Flush()
	})
	if err != nil {
		log.Printf("Subscribe error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer sub.Unsubscribe()

	// Send initial connection message
	connMsg := gin.H{
		"type":      "connected",
		"subject":   subject,
		"timestamp": time.Now().Unix(),
	}
	connData, _ := json.Marshal(connMsg)
	c.Writer.Write([]byte("data: " + string(connData) + "\n\n"))
	flusher.Flush()

	// Keep connection alive
	notify := c.Writer.CloseNotify()
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-notify:
			return
		case <-ticker.C:
			c.Writer.Write([]byte(": keepalive\n\n"))
			flusher.Flush()
		}
	}
}

// GetActiveSubscriptions returns currently active subscriptions info
func (h *CoreNATShandler) GetActiveSubscriptions(c *gin.Context) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	// Get subscription info from NATS connection
	subs := h.nc.Status()

	c.JSON(http.StatusOK, gin.H{
		"status":    subs.String(),
		"connected": h.nc.IsConnected(),
		"server":    h.nc.ConnectedUrl(),
		"count":     0, // We don't track active subscriptions in-memory
	})
}

// GetServiceDiscovery returns information about services (subscriptions) in the NATS cluster
func (h *CoreNATShandler) GetServiceDiscovery(c *gin.Context) {
	// Get basic connection info that always works
	status := h.nc.Status()

	// Try to get server info via system requests, but don't fail if it doesn't work
	var serverResp struct {
		ServerName   string `json:"server_name"`
		Version      string `json:"version"`
		HostName     string `json:"host"`
		Port         int    `json:"port"`
		AuthRequired bool   `json:"auth_required"`
		TLSRequired  bool   `json:"tls_required"`
		MaxPayload   int64  `json:"max_payload"`
	}

	serverInfo, err := h.nc.Request("$SYS.REQ.SERVER.PING", []byte("{}"), 2*time.Second)
	if err == nil && serverInfo != nil {
		_ = json.Unmarshal(serverInfo.Data, &serverResp)
	}

	// Get server URL info
	connectedUrl := h.nc.ConnectedUrl()
	servers := h.nc.Servers()
	var serverCount int
	if servers != nil {
		serverCount = len(servers)
	}

	c.JSON(http.StatusOK, gin.H{
		"connected":     h.nc.IsConnected(),
		"status":        status.String(),
		"server_url":    connectedUrl,
		"server_count":  serverCount,
		"server_name":   serverResp.ServerName,
		"version":       serverResp.Version,
		"host":          serverResp.HostName,
		"port":          serverResp.Port,
		"max_payload":   serverResp.MaxPayload,
		"auth_required": serverResp.AuthRequired,
		"tls_required":  serverResp.TLSRequired,
	})
}

// MonitorTraffic starts a traffic monitoring session
// This captures messages on specified subjects and provides statistics
func (h *CoreNATShandler) MonitorTraffic(c *gin.Context) {
	subjects := c.QueryArray("subjects")
	if len(subjects) == 0 {
		subjects = []string{">"} // Monitor all subjects by default
	}

	// Set SSE headers
	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Writer.Header().Set("Access-Control-Allow-Origin", "*")

	flusher, ok := c.Writer.(http.Flusher)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Streaming not supported"})
		return
	}

	// Track statistics
	type TrafficStats struct {
		Subject  string
		Count    int64
		Bytes    int64
		LastSeen int64
	}
	stats := make(map[string]*TrafficStats)
	var mu sync.Mutex

	// Subscribe to all requested subjects
	subs := make([]*nats.Subscription, 0, len(subjects))

	for _, subject := range subjects {
		sub, err := h.nc.Subscribe(subject, func(msg *nats.Msg) {
			mu.Lock()
			if _, exists := stats[msg.Subject]; !exists {
				stats[msg.Subject] = &TrafficStats{Subject: msg.Subject}
			}
			s := stats[msg.Subject]
			s.Count++
			s.Bytes += int64(len(msg.Data))
			s.LastSeen = time.Now().Unix()
			mu.Unlock()

			// Send message info
			msgInfo := gin.H{
				"type":      "message",
				"subject":   msg.Subject,
				"reply":     msg.Reply,
				"size":      len(msg.Data),
				"timestamp": time.Now().Unix(),
			}

			// Include data for small messages
			if len(msg.Data) < 4096 {
				msgInfo["data"] = string(msg.Data)
				msgInfo["data_base64"] = base64.StdEncoding.EncodeToString(msg.Data)
			}

			data, _ := json.Marshal(msgInfo)
			c.Writer.Write([]byte("data: " + string(data) + "\n\n"))
			flusher.Flush()
		})
		if err != nil {
			log.Printf("Failed to subscribe to %s: %v", subject, err)
			continue
		}
		subs = append(subs, sub)
	}

	// Send initial stats
	c.Writer.Write([]byte("event: connected\ndata: {\"type\":\"connected\",\"subjects\":" + fmt.Sprintf("%q", subjects) + "}\n\n"))
	flusher.Flush()

	// Keep connection alive and send periodic stats
	notify := c.Writer.CloseNotify()
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-notify:
			// Clean up subscriptions
			for _, sub := range subs {
				sub.Unsubscribe()
			}
			return
		case <-ticker.C:
			mu.Lock()
			statsList := make([]gin.H, 0, len(stats))
			for _, s := range stats {
				statsList = append(statsList, gin.H{
					"subject":   s.Subject,
					"count":     s.Count,
					"bytes":     s.Bytes,
					"last_seen": s.LastSeen,
				})
			}
			mu.Unlock()

			statsMsg := gin.H{
				"type":      "stats",
				"stats":     statsList,
				"timestamp": time.Now().Unix(),
			}
			data, _ := json.Marshal(statsMsg)
			c.Writer.Write([]byte("event: stats\ndata: " + string(data) + "\n\n"))
			flusher.Flush()
		}
	}
}
