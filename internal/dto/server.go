package dto

// DashboardStatsResponse represents dashboard statistics
type DashboardStatsResponse struct {
	Streams      int    `json:"streams"`
	Consumers    int    `json:"consumers"`
	Messages     uint64 `json:"messages"`
	Bytes        uint64 `json:"bytes"`
	Connections  int    `json:"connections"`
	ServerStatus string `json:"server_status"`
}

// AccountInfoResponse represents account information
type AccountInfoResponse struct {
	ID        string `json:"id"`
	JetStream bool   `json:"jetstream_enabled"`
	Domain    string `json:"domain"`
	APIUrl    string `json:"api_url"`
	URL       string `json:"url"`
}

// ConnectionInfo represents a NATS connection
type ConnectionInfo struct {
	CID          uint64 `json:"cid"`
	Type         string `json:"type"`
	Name         string `json:"name"`
	User         string `json:"user"`
	IP           string `json:"ip"`
	Server       string `json:"server"`
	SubsCount    int    `json:"subs_count"`
	ConnectedAt  string `json:"connected_at"`
	LastActivity string `json:"last_activity"`
}

// ConnectionsResponse represents the connections list response
type ConnectionsResponse struct {
	Connections []ConnectionInfo `json:"connections"`
	Total       int              `json:"total"`
}

// SubjectInfo represents subject information
type SubjectInfo struct {
	Name     string `json:"name"`
	Count    int64  `json:"count"`
	LastSeen string `json:"last_seen,omitempty"`
}

// SubjectsResponse represents the subjects list response
type SubjectsResponse struct {
	Subjects []SubjectInfo `json:"subjects"`
	Total    int           `json:"total"`
}

// SystemMetricsResponse represents system metrics
type SystemMetricsResponse struct {
	Memory       MemoryMetrics `json:"memory"`
	CPU          CPUMetrics    `json:"cpu"`
	Connections  int           `json:"connections"`
	Subscribers  int           `json:"subscribers"`
	MessagesSent int64         `json:"messages_sent"`
	MessagesRecv int64         `json:"messages_received"`
}

// MemoryMetrics represents memory metrics
type MemoryMetrics struct {
	Used    uint64  `json:"used"`
	Total   uint64  `json:"total"`
	Percent float64 `json:"percent"`
}

// CPUMetrics represents CPU metrics
type CPUMetrics struct {
	Percent float64 `json:"percent"`
}

// RateMetricsResponse represents rate metrics
type RateMetricsResponse struct {
	MessagesSentPerSec float64 `json:"messages_sent_per_sec"`
	MessagesRecvPerSec float64 `json:"messages_recv_per_sec"`
	BytesSentPerSec    uint64  `json:"bytes_sent_per_sec"`
	BytesRecvPerSec    uint64  `json:"bytes_recv_per_sec"`
}
