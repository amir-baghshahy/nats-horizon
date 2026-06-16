package dto

type ErrorResponse struct {
	Error   string `json:"error"`
	Code    string `json:"code,omitempty"`
	Details string `json:"details,omitempty"`
}

type SuccessResponse struct {
	Message string `json:"message"`
}

type HealthResponse struct {
	Status    string `json:"status"`
	Timestamp string `json:"timestamp"`
	NATS      string `json:"nats"`
}

type MessageResponse struct {
	Subject   string              `json:"subject"`
	Sequence  uint64              `json:"sequence"`
	Data      string              `json:"data"`
	Headers   map[string][]string `json:"headers"`
	Timestamp string              `json:"timestamp"`
}

type PublishMessageRequest struct {
	Subject string `json:"subject" binding:"required"`
	Data    string `json:"data" binding:"required"`
}
