package middleware

import (
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type clientInfo struct {
	count       int
	windowStart time.Time
}

// RateLimiter implements a simple in-memory rate limiter
type RateLimiter struct {
	clients   map[string]*clientInfo
	mu        sync.RWMutex
	limit     int
	window    time.Duration
	cleanup   time.Duration
	lastClean time.Time
}

// NewRateLimiter creates a new rate limiter
func NewRateLimiter(limit int, window, cleanup time.Duration) *RateLimiter {
	rl := &RateLimiter{
		clients:   make(map[string]*clientInfo),
		limit:     limit,
		window:    window,
		cleanup:   cleanup,
		lastClean: time.Now(),
	}
	go rl.cleanupRoutine()
	return rl
}

// cleanupRoutine periodically removes stale entries
func (rl *RateLimiter) cleanupRoutine() {
	ticker := time.NewTicker(rl.cleanup)
	defer ticker.Stop()
	for range ticker.C {
		rl.mu.Lock()
		now := time.Now()
		for ip, info := range rl.clients {
			if now.Sub(info.windowStart) > rl.window*2 {
				delete(rl.clients, ip)
			}
		}
		rl.lastClean = now
		rl.mu.Unlock()
	}
}

// getClientIP extracts the real client IP from the request
func (rl *RateLimiter) getClientIP(c *gin.Context) string {
	ip := c.ClientIP()
	if xff := c.GetHeader("X-Forwarded-For"); xff != "" {
		parts := strings.Split(xff, ",")
		ip = strings.TrimSpace(parts[0])
	}
	return ip
}

// Allow checks if the request is allowed under the rate limit
func (rl *RateLimiter) Allow(c *gin.Context) bool {
	ip := rl.getClientIP(c)

	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	info, exists := rl.clients[ip]

	if !exists || now.Sub(info.windowStart) > rl.window {
		rl.clients[ip] = &clientInfo{
			count:       1,
			windowStart: now,
		}
		return true
	}

	if info.count >= rl.limit {
		return false
	}

	info.count++
	return true
}

// RateLimitMiddleware creates a rate limiting middleware
func RateLimitMiddleware(limiter *RateLimiter) gin.HandlerFunc {
	return func(c *gin.Context) {
		if !limiter.Allow(c) {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":       "rate limit exceeded",
				"retry_after": limiter.window.String(),
			})
			c.Abort()
			return
		}
		c.Next()
	}
}
