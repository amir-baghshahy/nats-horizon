package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/nats-io/nats.go"
)

// ClusterHandler handles cluster monitoring operations
type ClusterHandler struct {
	nc *nats.Conn
	js nats.JetStreamContext
}

// NewClusterHandler creates a new cluster handler
func NewClusterHandler(nc *nats.Conn, js nats.JetStreamContext) *ClusterHandler {
	return &ClusterHandler{nc: nc, js: js}
}

// ClusterInfo represents cluster information
type ClusterInfo struct {
	Name     string     `json:"name"`
	Leader   string     `json:"leader"`
	Replicas []NodeInfo `json:"replicas"`
	Healthy  bool       `json:"healthy"`
}

// NodeInfo represents information about a cluster node
type NodeInfo struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Current bool   `json:"current"`
	Healthy bool   `json:"healthy"`
	Lag     uint64 `json:"lag"`
	Active  bool   `json:"active"`
}

// GetClusterInfo returns cluster information
func (h *ClusterHandler) GetClusterInfo(c *gin.Context) {
	// Get server info using $JS.API.SERVER.PING with fallback
	serverName := ""
	clusterName := "standalone"
	clusterURL := ""
	isClustered := false
	jsDomain := ""
	jsTier := "standard"
	jsAPI := "0"

	msg, err := h.nc.Request("$JS.API.SERVER.PING", []byte{}, 2*time.Second)
	if err == nil && msg != nil {
		var serverInfo struct {
			Name       string `json:"server_name"`
			Cluster    string `json:"cluster"`
			ClusterURL string `json:"cluster_url"`
		}
		if json.Unmarshal(msg.Data, &serverInfo) == nil {
			serverName = serverInfo.Name
			clusterName = serverInfo.Cluster
			clusterURL = serverInfo.ClusterURL
			isClustered = serverInfo.Cluster != ""
			if !isClustered {
				clusterName = "standalone"
			}
		}
	}

	if serverName == "" {
		serverName = h.nc.ConnectedUrl()
	}

	// Get account info for additional cluster stats with fallback
	accountInfo, err := h.js.AccountInfo()
	if err == nil {
		jsDomain = accountInfo.Domain
		// Tier is a struct, use a simple string representation
		jsTier = "standard"
		jsAPI = fmt.Sprintf("%d", accountInfo.API.Level)
	}

	c.JSON(http.StatusOK, gin.H{
		"cluster_name": clusterName,
		"is_clustered": isClustered,
		"server_name":  serverName,
		"cluster_url":  clusterURL,
		"jetstream": gin.H{
			"enabled":   true,
			"domain":    jsDomain,
			"tier":      jsTier,
			"api_level": jsAPI,
		},
	})
}

// GetClusterNodes returns information about cluster nodes
func (h *ClusterHandler) GetClusterNodes(c *gin.Context) {
	// Try to get cluster info from ROUTERZ
	msg, err := h.nc.Request("$SYS.CLUSTER.INFO", []byte{}, 2*time.Second)
	if err != nil {
		// If not available, return current connection info
		c.JSON(http.StatusOK, gin.H{
			"nodes": []gin.H{{
				"id":      h.nc.ConnectedServerId(),
				"name":    h.nc.ConnectedUrl(),
				"current": true,
				"healthy": h.nc.IsConnected(),
				"lag":     0,
				"active":  true,
			}},
			"clustered": false,
		})
		return
	}

	var clusterInfo struct {
		Name  string `json:"name"`
		Nodes []struct {
			ID      string `json:"name"`
			Current bool   `json:"current"`
			Offline bool   `json:"offline"`
			Active  bool   `json:"active"`
		} `json:"nodes"`
	}

	if err := json.Unmarshal(msg.Data, &clusterInfo); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	nodes := []gin.H{}
	for _, node := range clusterInfo.Nodes {
		nodes = append(nodes, gin.H{
			"id":      node.ID,
			"name":    node.ID,
			"current": node.Current,
			"healthy": !node.Offline,
			"lag":     0, // Not available without monitoring
			"active":  node.Active,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"nodes":        nodes,
		"clustered":    true,
		"cluster_name": clusterInfo.Name,
	})
}

// GetStreamReplicas returns replication info for a stream
func (h *ClusterHandler) GetStreamReplicas(c *gin.Context) {
	streamName := c.Param("name")

	info, err := h.js.StreamInfo(streamName)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "stream not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"stream":       streamName,
		"replicas":     info.Config.Replicas,
		"placement":    info.Config.Placement,
		"mirror":       info.Config.Mirror,
		"sources":      info.Config.Sources,
		"cluster":      info.Cluster,
		"is_clustered": info.Cluster != nil,
	})
}

// GetClusterHealth returns overall cluster health
func (h *ClusterHandler) GetClusterHealth(c *gin.Context) {
	// Get server health
	health := gin.H{
		"connected": h.nc.IsConnected(),
		"status":    "ok",
	}

	if !h.nc.IsConnected() {
		health["status"] = "disconnected"
		c.JSON(http.StatusServiceUnavailable, health)
		return
	}

	// Get server stats
	status := h.nc.Status()
	health["server_status"] = status.String()

	// Get connected server info
	health["connected_server"] = gin.H{
		"id":  h.nc.ConnectedServerId(),
		"url": h.nc.ConnectedUrl(),
	}

	// Check JetStream health
	accountInfo, err := h.js.AccountInfo()
	if err != nil {
		health["jetstream"] = gin.H{"status": "error", "error": err.Error()}
	} else {
		health["jetstream"] = gin.H{
			"status": "ok",
			"domain": accountInfo.Domain,
			"tiers":  accountInfo.Tier,
		}
	}

	c.JSON(http.StatusOK, health)
}
