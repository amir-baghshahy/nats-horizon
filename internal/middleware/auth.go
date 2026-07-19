package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// BasicAuthConfig defines the configuration for basic authentication
type BasicAuthConfig struct {
	Users map[string]string
	Realm string
}

// BasicAuth creates a basic authentication middleware
func BasicAuth(config BasicAuthConfig) gin.HandlerFunc {
	if len(config.Users) == 0 {
		return func(c *gin.Context) {
			c.Next()
		}
	}

	realm := config.Realm
	if realm == "" {
		realm = "Restricted"
	}

	return func(c *gin.Context) {
		username, password, hasAuth := c.Request.BasicAuth()

		if !hasAuth {
			c.Header("WWW-Authenticate", "Basic realm=\""+realm+"\"")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "authentication required"})
			c.Abort()
			return
		}

		expectedPassword, exists := config.Users[username]
		if !exists || password != expectedPassword {
			c.Header("WWW-Authenticate", "Basic realm=\""+realm+"\"")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
			c.Abort()
			return
		}

		c.Set("user", username)
		c.Next()
	}
}

// APIKeyAuth creates an API key authentication middleware
func APIKeyAuth(headerName, apiKey string) gin.HandlerFunc {
	if apiKey == "" {
		return func(c *gin.Context) {
			c.Next()
		}
	}

	return func(c *gin.Context) {
		key := c.GetHeader(headerName)
		if key == "" {
			key = c.Query("api_key")
		}

		if key != apiKey {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid API key"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// CORSMiddlewareWithValidation creates a CORS middleware that validates origins
func CORSMiddlewareWithValidation(allowedOrigins string) gin.HandlerFunc {
	if allowedOrigins == "" || allowedOrigins == "*" {
		return func(c *gin.Context) {
			c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS")
			c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization, X-Request-ID")
			c.Writer.Header().Set("Access-Control-Expose-Headers", "X-Request-ID")

			if c.Request.Method == "OPTIONS" {
				c.AbortWithStatus(http.StatusNoContent)
				return
			}

			c.Next()
		}
	}

	origins := strings.Split(allowedOrigins, ",")
	originSet := make(map[string]bool, len(origins))
	for _, o := range origins {
		originSet[strings.TrimSpace(o)] = true
	}

	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")

		if originSet[origin] {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			c.Writer.Header().Set("Vary", "Origin")
		}

		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization, X-Request-ID")
		c.Writer.Header().Set("Access-Control-Expose-Headers", "X-Request-ID")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
