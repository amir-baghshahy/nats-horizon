package apihttp

import (
	"fmt"
	"net/http"

	"github.com/amir-baghshahy/nats-horizon/internal/dto"
	"github.com/gin-gonic/gin"
)

// JSONError sends a consistent error response.
func JSONError(c *gin.Context, status int, errMsg, details string) {
	c.JSON(status, dto.ErrorResponse{
		Error:   errMsg,
		Details: details,
	})
}

// JSONNotFound sends a 404 not found error.
func JSONNotFound(c *gin.Context, resource, name string) {
	c.JSON(http.StatusNotFound, dto.ErrorResponse{
		Error:   fmt.Sprintf("%s %q not found", resource, name),
		Details: fmt.Sprintf("%s=%s", resource, name),
	})
}

// JSONBadRequest sends a 400 bad request error.
func JSONBadRequest(c *gin.Context, msg string) {
	c.JSON(http.StatusBadRequest, dto.ErrorResponse{
		Error: msg,
	})
}

// JSONInternalError sends a 500 internal server error.
func JSONInternalError(c *gin.Context, err error, msg string) {
	details := ""
	if err != nil {
		details = err.Error()
	}
	c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
		Error:   msg,
		Details: details,
	})
}
