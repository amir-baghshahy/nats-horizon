package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/nats-io/nats.go"
)

// KVHandler handles KV store operations
type KVHandler struct {
	nc *nats.Conn
	js nats.JetStreamContext
}

// NewKVHandler creates a new KV handler
func NewKVHandler(nc *nats.Conn, js nats.JetStreamContext) *KVHandler {
	return &KVHandler{nc: nc, js: js}
}

// ListBuckets returns all KV buckets
func (h *KVHandler) ListBuckets(c *gin.Context) {
	// List all keystores in the current account
	storeNames := []string{}
	offset := 0
	limit := 256

	for {
		// Get stream list with pagination
		req := fmt.Sprintf(`{"offset":%d,"limit":%d}`, offset, limit)
		msg, err := h.nc.Request("$JS.API.STREAM.LIST", []byte(req), 5*time.Second)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to list streams: %v", err)})
			return
		}

		var response struct {
			Streams []struct {
				Config struct {
					Name   string `json:"name"`
					Sealed bool   `json:"sealed"`
					Mirror *struct {
						Name string `json:"name"`
					} `json:"mirror"`
					Sources []struct {
						Name string `json:"name"`
					} `json:"sources"`
				} `json:"config"`
			} `json:"streams"`
			Total  int `json:"total"`
			Offset int `json:"offset"`
		}

		if err := json.Unmarshal(msg.Data, &response); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to parse response: %v", err)})
			return
		}

		// Collect KV bucket names
		for _, stream := range response.Streams {
			name := stream.Config.Name

			// Skip sealed streams, mirrors, and source streams (not primary KV buckets)
			if stream.Config.Sealed || stream.Config.Mirror != nil || len(stream.Config.Sources) > 0 {
				continue
			}

			// Check if it's a KV bucket (has KV_ prefix)
			if len(name) > 3 && name[:3] == "KV_" {
				storeNames = append(storeNames, name)
			}
		}

		// Check if we've got all streams
		if offset+len(response.Streams) >= response.Total {
			break
		}
		offset += len(response.Streams)
	}

	// Get bucket information for each store
	buckets := []gin.H{}
	for _, name := range storeNames {
		// Extract bucket name (remove KV_ prefix)
		bucketName := name[3:]

		kv, err := h.js.KeyValue(bucketName)
		if err != nil {
			// Try with full name
			kv, err = h.js.KeyValue(name)
			if err != nil {
				continue
			}
		}

		status, err := kv.Status()
		if err != nil {
			continue
		}

		buckets = append(buckets, gin.H{
			"name":        name,
			"bucket_name": bucketName,
			"values":      status.Values(),
			"bytes":       status.Bytes(),
		})
	}

	c.JSON(http.StatusOK, buckets)
}

// GetBucket returns detailed bucket information
func (h *KVHandler) GetBucket(c *gin.Context) {
	bucketName := c.Param("name")

	kv, err := h.js.KeyValue(bucketName)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "bucket not found"})
		return
	}

	status, err := kv.Status()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"name":   bucketName,
		"values": status.Values(),
		"bytes":  status.Bytes(),
	})
}

// CreateBucket creates a new KV bucket
func (h *KVHandler) CreateBucket(c *gin.Context) {
	var req struct {
		Name         string `json:"name" binding:"required"`
		History      uint64 `json:"history"`
		TTL          uint64 `json:"ttl"`
		MaxBytes     uint64 `json:"max_bytes"`
		MaxValueSize uint64 `json:"max_value_size"`
		Compression  bool   `json:"compression"`
		Replicas     int    `json:"replicas"`
		Storage      string `json:"storage"` // "file" or "memory"
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate bucket name
	if req.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bucket name is required"})
		return
	}

	// Validate bucket name format (NATS requires valid names)
	for i, ch := range req.Name {
		if !((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') || ch == '_' || ch == '-' || (i > 0 && (ch == '.'))) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid bucket name: must contain only letters, numbers, underscores, hyphens, and dots (cannot start with dot)"})
			return
		}
	}

	// Validate payload sizes
	const maxPayloadSize = 1 << 30 // 1GB
	if req.MaxBytes > maxPayloadSize {
		c.JSON(http.StatusBadRequest, gin.H{"error": "max_bytes exceeds maximum allowed size"})
		return
	}
	if req.MaxValueSize > maxPayloadSize {
		c.JSON(http.StatusBadRequest, gin.H{"error": "max_value_size exceeds maximum allowed size"})
		return
	}

	// Determine storage type
	storage := nats.FileStorage
	if req.Storage == "memory" {
		storage = nats.MemoryStorage
	}

	// Set defaults
	history := uint8(1)
	if req.History > 0 && req.History <= 64 {
		history = uint8(req.History)
	}

	replicas := 1
	if req.Replicas > 0 && req.Replicas <= 5 {
		replicas = req.Replicas
	}

	// Create the bucket with configuration
	kv, err := h.js.CreateKeyValue(&nats.KeyValueConfig{
		Bucket:       req.Name,
		Description:  "Created via NATS Monitoring UI",
		MaxBytes:     int64(req.MaxBytes),
		MaxValueSize: int32(req.MaxValueSize),
		History:      history,
		TTL:          time.Duration(req.TTL) * time.Second,
		Storage:      storage,
		Replicas:     replicas,
		Compression:  req.Compression,
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create bucket: %v", err)})
		return
	}

	status, _ := kv.Status()

	c.JSON(http.StatusCreated, gin.H{
		"name":    req.Name,
		"values":  status.Values(),
		"history": history,
	})
}

// DeleteBucket deletes a KV bucket
func (h *KVHandler) DeleteBucket(c *gin.Context) {
	bucketName := c.Param("name")

	err := h.js.DeleteKeyValue(bucketName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "bucket deleted", "name": bucketName})
}

// ListKeys returns all keys in a bucket
func (h *KVHandler) ListKeys(c *gin.Context) {
	bucketName := c.Param("name")

	kv, err := h.js.KeyValue(bucketName)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "bucket not found"})
		return
	}

	// List all keys
	keysList, err := kv.Keys()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	keys := []gin.H{}
	for _, key := range keysList {
		entry, err := kv.Get(key)
		if err != nil {
			continue
		}

		keys = append(keys, gin.H{
			"key":      key,
			"value":    string(entry.Value()),
			"revision": entry.Revision(),
			"created":  entry.Created(),
		})
	}

	c.JSON(http.StatusOK, keys)
}

// GetKey returns a specific key from a bucket
func (h *KVHandler) GetKey(c *gin.Context) {
	bucketName := c.Param("name")
	key := c.Query("key")
	if key == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "key parameter required"})
		return
	}

	kv, err := h.js.KeyValue(bucketName)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "bucket not found"})
		return
	}

	entry, err := kv.Get(key)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "key not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"key":      key,
		"value":    string(entry.Value()),
		"revision": entry.Revision(),
		"created":  entry.Created(),
		"delta":    entry.Delta(),
	})
}

// GetKeyHistory returns the history of a key
func (h *KVHandler) GetKeyHistory(c *gin.Context) {
	bucketName := c.Param("name")
	key := c.Query("key")
	if key == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "key parameter required"})
		return
	}

	kv, err := h.js.KeyValue(bucketName)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "bucket not found"})
		return
	}

	// Get history watcher
	watcher, err := kv.Watch(key, nil, nats.IgnoreDeletes(), nats.UpdatesOnly())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer watcher.Stop()

	history := []gin.H{}
	for entry := range watcher.Updates() {
		if entry == nil {
			break
		}

		history = append(history, gin.H{
			"key":       entry.Key(),
			"value":     string(entry.Value()),
			"revision":  entry.Revision(),
			"created":   entry.Created(),
			"operation": entry.Operation().String(),
		})
	}

	c.JSON(http.StatusOK, history)
}

// PutKey creates or updates a key
func (h *KVHandler) PutKey(c *gin.Context) {
	bucketName := c.Param("name")

	var req struct {
		Key   string `json:"key" binding:"required"`
		Value string `json:"value" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	kv, err := h.js.KeyValue(bucketName)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "bucket not found"})
		return
	}

	_, err = kv.Put(req.Key, []byte(req.Value))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "key created/updated",
		"key":     req.Key,
	})
}

// DeleteKey deletes a key
func (h *KVHandler) DeleteKey(c *gin.Context) {
	bucketName := c.Param("name")
	key := c.Query("key")
	if key == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "key parameter required"})
		return
	}

	kv, err := h.js.KeyValue(bucketName)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "bucket not found"})
		return
	}

	err = kv.Delete(key)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "key deleted",
		"key":     key,
	})
}

// PurgeBucket removes all deleted keys from a bucket
func (h *KVHandler) PurgeBucket(c *gin.Context) {
	bucketName := c.Param("name")

	kv, err := h.js.KeyValue(bucketName)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "bucket not found"})
		return
	}

	err = kv.PurgeDeletes()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "bucket purged",
		"name":    bucketName,
	})
}
