package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"nats-monitoring/internal/dto"
	"nats-monitoring/internal/usecase"
	"nats-monitoring/internal/utils"
)

// StreamHandler handles HTTP requests for streams
type StreamHandler struct {
	useCase *usecase.StreamUseCase
}

// NewStreamHandler creates a new stream handler
func NewStreamHandler(useCase *usecase.StreamUseCase) *StreamHandler {
	return &StreamHandler{useCase: useCase}
}

// ListStreams handles GET /streams
func (h *StreamHandler) ListStreams(c *gin.Context) {
	streams, err := h.useCase.ListStreams(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to list streams",
			Details: err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, utils.StreamsToResponse(streams))
}

// GetStream handles GET /streams/:name
func (h *StreamHandler) GetStream(c *gin.Context) {
	name := c.Param("name")
	stream, err := h.useCase.GetStream(c.Request.Context(), name)
	if err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error: "Stream not found",
			Details: err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, utils.StreamToResponse(stream))
}

// CreateStream handles POST /streams
func (h *StreamHandler) CreateStream(c *gin.Context) {
	var req dto.CreateStreamRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "Invalid request",
			Details: err.Error(),
		})
		return
	}

	stream := &usecase.StreamCreate{
		Name:     req.Name,
		Subjects: req.Subjects,
		Storage:  req.Storage,
		Retention: req.Retention,
		Replicas: req.Replicas,
		MaxAge:   req.MaxAge,
		MaxBytes: req.MaxBytes,
	}

	result, err := h.useCase.CreateStream(c.Request.Context(), stream)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to create stream",
			Details: err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, utils.StreamToResponse(result))
}

// UpdateStream handles PUT /streams/:name
func (h *StreamHandler) UpdateStream(c *gin.Context) {
	name := c.Param("name")
	var req dto.UpdateStreamRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "Invalid request",
			Details: err.Error(),
		})
		return
	}

	stream := &usecase.StreamUpdate{
		Name:     name,
		Subjects: req.Subjects,
		Replicas: req.Replicas,
	}

	result, err := h.useCase.UpdateStream(c.Request.Context(), stream)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to update stream",
			Details: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, utils.StreamToResponse(result))
}

// DeleteStream handles DELETE /streams/:name
func (h *StreamHandler) DeleteStream(c *gin.Context) {
	name := c.Param("name")
	if err := h.useCase.DeleteStream(c.Request.Context(), name); err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to delete stream",
			Details: err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, dto.SuccessResponse{Message: "Stream deleted successfully"})
}

// PurgeStream handles POST /streams/:name/purge
func (h *StreamHandler) PurgeStream(c *gin.Context) {
	name := c.Param("name")
	var req dto.PurgeStreamRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "Invalid request",
			Details: err.Error(),
		})
		return
	}

	remaining, err := h.useCase.PurgeStream(c.Request.Context(), name, req.Subject, req.Sequence)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to purge stream",
			Details: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.PurgeStreamResponse{
		Remaining: remaining,
		Message:   "Stream purged successfully",
	})
}
