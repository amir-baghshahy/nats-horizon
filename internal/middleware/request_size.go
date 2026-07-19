package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

const (
	MaxRequestSize = 10 << 20 // 10MB
)

func RequestSizeLimitMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, MaxRequestSize)
		c.Next()
	}
}
