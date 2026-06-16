package dto

type StreamResponse struct {
	Config *StreamConfigResponse `json:"config"`
	State  *StreamStateResponse  `json:"state"`
}

type StreamConfigResponse struct {
	Name      string   `json:"name"`
	Subjects  []string `json:"subjects"`
	Storage   string   `json:"storage"`
	Retention string   `json:"retention"`
	Replicas  int      `json:"replicas"`
	MaxAge    string   `json:"max_age,omitempty"`
	MaxBytes  uint64   `json:"max_bytes,omitempty"`
}

type StreamStateResponse struct {
	Messages    uint64 `json:"messages"`
	Bytes       uint64 `json:"bytes"`
	Consumers   int    `json:"consumers"`
	FirstSeq    uint64 `json:"first_seq"`
	LastSeq     uint64 `json:"last_seq"`
	FirstTs     string `json:"first_ts"`
	LastTs      string `json:"last_ts"`
	NumPending  uint64 `json:"num_pending"`
	DeleteMarks uint64 `json:"delete_marks"`
}

type CreateStreamRequest struct {
	Name      string   `json:"name" binding:"required"`
	Subjects  []string `json:"subjects" binding:"required,min=1"`
	Storage   string   `json:"storage" binding:"required,oneof=file memory"`
	Retention string   `json:"retention" binding:"omitempty,oneof=limits interest workqueue"`
	Replicas  int      `json:"replicas" binding:"omitempty,min=1,max=5"`
	MaxAge    string   `json:"max_age,omitempty"`
	MaxBytes  uint64   `json:"max_bytes,omitempty"`
}

type UpdateStreamRequest struct {
	Subjects []string `json:"subjects" binding:"omitempty"`
	Replicas int      `json:"replicas" binding:"omitempty,min=1,max=5"`
	MaxAge   string   `json:"max_age,omitempty"`
	MaxBytes uint64   `json:"max_bytes,omitempty"`
}

type PurgeStreamRequest struct {
	Subject  string `json:"subject"`
	Sequence uint64 `json:"sequence"`
}

type PurgeStreamResponse struct {
	Remaining uint64 `json:"remaining"`
	Message   string `json:"message"`
}
