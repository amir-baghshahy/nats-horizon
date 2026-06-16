package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/nats-io/nats.go"
	"nats-monitoring/internal/constants"
	"nats-monitoring/internal/dto"
)

// ServerHandler handles server-related HTTP requests
type ServerHandler struct {
	nc *nats.Conn
	js nats.JetStreamContext
}

// NewServerHandler creates a new server handler
func NewServerHandler(nc *nats.Conn, js nats.JetStreamContext) *ServerHandler {
	return &ServerHandler{nc: nc, js: js}
}

type streamListInfoResponse struct {
	Streams []struct {
		Config struct {
			Name     string   `json:"name"`
			Subjects []string `json:"subjects"`
		} `json:"config"`
		State struct {
			Messages  uint64 `json:"messages"`
			Bytes     uint64 `json:"bytes"`
			Consumers int    `json:"consumer_count"`
			FirstSeq  uint64 `json:"first_seq"`
			LastSeq   uint64 `json:"last_seq"`
			FirstTs   string `json:"first_ts"`
			LastTs    string `json:"last_ts"`
		} `json:"state"`
	} `json:"streams"`
}

// GetDashboardStats returns dashboard statistics from NATS
func (h *ServerHandler) GetDashboardStats(c *gin.Context) {
	streamCount := 0
	consumerCount := 0
	totalMessages := uint64(0)
	totalBytes := uint64(0)

	msg, err := h.nc.Request(constants.APIStreamList, []byte(`{"subjects_filter":">"}`), constants.LongRequestTimeout)
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, dto.DashboardStatsResponse{
			ServerStatus: "disconnected",
		})
		return
	}

	var response streamListInfoResponse
	if err := json.Unmarshal(msg.Data, &response); err != nil {
		log.Printf("Failed to parse stream list: %v", err)
		c.JSON(http.StatusServiceUnavailable, dto.DashboardStatsResponse{
			ServerStatus: "disconnected",
		})
		return
	}

	streamCount = len(response.Streams)

	for _, stream := range response.Streams {
		totalMessages += stream.State.Messages
		totalBytes += stream.State.Bytes
		consumerCount += stream.State.Consumers
	}

	connections := 0
	natsStatus := "disconnected"
	if h.nc != nil && h.nc.Status() == nats.CONNECTED {
		connections = 1
		natsStatus = "connected"
	}

	c.JSON(http.StatusOK, dto.DashboardStatsResponse{
		Streams:     streamCount,
		Consumers:   consumerCount,
		Messages:    totalMessages,
		Bytes:       totalBytes,
		Connections: connections,
		ServerStatus: natsStatus,
	})
}

// GetAccountInfo returns detailed JetStream account information
func (h *ServerHandler) GetAccountInfo(c *gin.Context) {
	if h.js == nil {
		c.JSON(http.StatusServiceUnavailable, dto.ErrorResponse{
			Error: "JetStream not available",
		})
		return
	}

	info, err := h.js.AccountInfo()
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to get account info",
			Details: err.Error(),
		})
		return
	}

	// Create a simplified account info response
	response := gin.H{
		"memory":  info.Tier.Memory,
		"storage": info.Tier.Store,
		"streams": info.Tier.Streams,
		"consumers": gin.H{
			"count": info.Tier.Consumers,
		},
		"limits": gin.H{
			"max_memory":      info.Limits.MaxMemory,
			"max_storage":     info.Limits.MaxStore,
			"max_streams":     info.Limits.MaxStreams,
			"max_consumers":   info.Limits.MaxConsumers,
			"max_ack_pending": info.Limits.MaxAckPending,
		},
		"api": gin.H{
			"level":  info.API.Level,
			"total":  info.API.Total,
			"errors": info.API.Errors,
		},
		"domain": info.Domain,
	}

	c.JSON(http.StatusOK, response)
}

// GetConnections returns connection info
func (h *ServerHandler) GetConnections(c *gin.Context) {
	connections := []dto.ConnectionInfo{}
	if h.nc != nil && h.nc.Status() == nats.CONNECTED {
		url := h.nc.ConnectedUrl()
		serverName := "NATS Server"

		if msg, err := h.nc.Request("$SYS.REQ.SERVER.PING", []byte("{}"), constants.DefaultRequestTimeout); err == nil && msg != nil {
			var serverResp struct {
				Name string `json:"server_name"`
			}
			if json.Unmarshal(msg.Data, &serverResp) == nil && serverResp.Name != "" {
				serverName = serverResp.Name
			}
		}

		connections = append(connections, dto.ConnectionInfo{
			CID:          0,
			Type:         "monitoring",
			Name:         "current",
			User:         "",
			IP:           url,
			Server:       serverName,
			SubsCount:    0,
			ConnectedAt:  time.Now().Format(time.RFC3339),
			LastActivity: time.Now().Format(time.RFC3339),
		})
	}

	c.JSON(http.StatusOK, dto.ConnectionsResponse{
		Connections: connections,
		Total:       len(connections),
	})
}

// GetSubjects returns subject information from stream configurations
func (h *ServerHandler) GetSubjects(c *gin.Context) {
	msg, err := h.nc.Request(constants.APIStreamList, []byte(`{"subjects_filter":">"}`), constants.LongRequestTimeout)
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, dto.ErrorResponse{
			Error: "NATS unavailable",
		})
		return
	}

	var response streamListInfoResponse
	if err := json.Unmarshal(msg.Data, &response); err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to parse stream list",
			Details: err.Error(),
		})
		return
	}

	subjects := []dto.SubjectInfo{}
	seen := make(map[string]bool)
	for _, stream := range response.Streams {
		for _, subject := range stream.Config.Subjects {
			if !seen[subject] {
				seen[subject] = true
				subjects = append(subjects, dto.SubjectInfo{
					Name:  subject,
					Count: int64(stream.State.Messages),
				})
			}
		}
	}

	c.JSON(http.StatusOK, dto.SubjectsResponse{
		Subjects: subjects,
		Total:    len(subjects),
	})
}

// GetMessages returns messages from a stream
func (h *ServerHandler) GetMessages(c *gin.Context) {
	stream := c.Query("stream")
	if stream == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "stream parameter required",
		})
		return
	}

	info, err := h.js.StreamInfo(stream)
	if err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error: "stream not found",
		})
		return
	}

	messages := []dto.MessageResponse{}
	lastSeq := info.State.LastSeq

	startSeq := lastSeq
	if startSeq > 25 {
		startSeq = lastSeq - 24
	} else {
		startSeq = 1
	}

	for i := startSeq; i <= lastSeq && len(messages) < 25; i++ {
		msg, err := h.js.GetMsg(stream, i)
		if err != nil {
			continue
		}

		messages = append(messages, dto.MessageResponse{
			Subject:   msg.Subject,
			Sequence:  msg.Sequence,
			Data:      string(msg.Data),
			Timestamp: msg.Time.Format(time.RFC3339),
			Headers:   make(map[string][]string),
		})
	}

	for i, j := 0, len(messages)-1; i < j; i, j = i+1, j-1 {
		messages[i], messages[j] = messages[j], messages[i]
	}

	c.JSON(http.StatusOK, messages)
}

// GetStreamMessagesByPage returns paginated messages from a stream
func (h *ServerHandler) GetStreamMessagesByPage(c *gin.Context) {
	stream := c.Query("stream")
	if stream == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "stream parameter required",
		})
		return
	}

	info, err := h.js.StreamInfo(stream)
	if err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error: "stream not found",
		})
		return
	}

	page := 1
	perPage := 25
	if p := c.Query("page"); p != "" {
		if parsed, err := strconv.Atoi(p); err == nil && parsed > 0 {
			page = parsed
		}
	}
	if pp := c.Query("per_page"); pp != "" {
		if parsed, err := strconv.Atoi(pp); err == nil && parsed > 0 && parsed <= 100 {
			perPage = parsed
		}
	}

	totalMessages := info.State.LastSeq
	totalPages := (int(totalMessages) + perPage - 1) / perPage
	if totalPages == 0 {
		totalPages = 1
	}

	offset := uint64((page - 1) * perPage)
	startSeq := totalMessages - offset - uint64(perPage) + 1
	endSeq := totalMessages - offset

	if startSeq < 1 {
		startSeq = 1
	}

	messages := []dto.MessageResponse{}
	for i := endSeq; i >= startSeq && len(messages) < perPage && i > 0; i-- {
		msg, err := h.js.GetMsg(stream, i)
		if err != nil {
			continue
		}

		messages = append(messages, dto.MessageResponse{
			Subject:   msg.Subject,
			Sequence:  msg.Sequence,
			Data:      string(msg.Data),
			Timestamp: msg.Time.Format(time.RFC3339),
			Headers:   make(map[string][]string),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"messages":    messages,
		"page":        page,
		"per_page":    perPage,
		"total":       totalMessages,
		"total_pages": totalPages,
	})
}

// GetSystemMetrics returns system metrics from NATS server
func (h *ServerHandler) GetSystemMetrics(c *gin.Context) {
	accountInfo, err := h.js.AccountInfo()
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to get account info",
			Details: err.Error(),
		})
		return
	}

	connections := 0
	if h.nc != nil && h.nc.Status() == nats.CONNECTED {
		connections = 1
	}

	memoryUsage := 0.0
	if accountInfo.Limits.MaxMemory > 0 {
		memoryUsage = float64(accountInfo.Tier.Memory) / float64(accountInfo.Limits.MaxMemory) * 100
	}

	storageUsage := 0.0
	if accountInfo.Limits.MaxStore > 0 {
		storageUsage = float64(accountInfo.Tier.Store) / float64(accountInfo.Limits.MaxStore) * 100
	}

	response := gin.H{
		"memory": gin.H{
			"used":  accountInfo.Tier.Memory,
			"max":   accountInfo.Limits.MaxMemory,
			"usage": memoryUsage,
		},
		"storage": gin.H{
			"used":  accountInfo.Tier.Store,
			"max":   accountInfo.Limits.MaxStore,
			"usage": storageUsage,
		},
		"connections": connections,
		"streams":     accountInfo.Tier.Streams,
		"consumers":   accountInfo.Tier.Consumers,
		"timestamp":   time.Now().Unix(),
	}

	c.JSON(http.StatusOK, response)
}

// GetRateMetrics returns message rate metrics for streams
func (h *ServerHandler) GetRateMetrics(c *gin.Context) {
	duration := 60
	if d := c.Query("duration"); d != "" {
		if parsed, err := strconv.Atoi(d); err == nil && parsed > 0 {
			duration = parsed
		}
	}

	msg, err := h.nc.Request(constants.APIStreamList, []byte(`{"subjects_filter":">"}`), constants.LongRequestTimeout)
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, dto.ErrorResponse{
			Error:   "NATS unavailable",
			Details: err.Error(),
		})
		return
	}

	var response streamListInfoResponse
	if err := json.Unmarshal(msg.Data, &response); err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to parse stream list",
			Details: err.Error(),
		})
		return
	}

	streamMetrics := []gin.H{}
	for _, stream := range response.Streams {
		streamMetrics = append(streamMetrics, gin.H{
			"name":     stream.Config.Name,
			"messages": stream.State.Messages,
			"bytes":    stream.State.Bytes,
			"first_ts": stream.State.FirstTs,
			"last_ts":  stream.State.LastTs,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"streams":   streamMetrics,
		"duration":  duration,
		"timestamp": time.Now().Unix(),
	})
}

// TerminateConnection handles DELETE /connections/:id
func (h *ServerHandler) TerminateConnection(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusNotImplemented, dto.ErrorResponse{
		Error:   "Connection termination requires NATS monitoring",
		Details: "Feature not available without NATS server monitoring enabled",
		Code:    id,
	})
}

// HealthCheck handles GET /health
func HealthCheck(nc *nats.Conn) gin.HandlerFunc {
	return func(c *gin.Context) {
		if nc == nil || !nc.IsConnected() {
			c.JSON(http.StatusServiceUnavailable, dto.HealthResponse{
				Status: "unhealthy",
				NATS:   "disconnected",
			})
			return
		}
		c.JSON(http.StatusOK, dto.HealthResponse{
			Status:    "ok",
			NATS:      "connected",
			Timestamp: time.Now().Format(time.RFC3339),
		})
	}
}

// GetServerInfo handles GET /server/info
func GetServerInfo(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"server_id": "nats-monitoring",
		"version":   "1.0.0",
		"connected": true,
	})
}
