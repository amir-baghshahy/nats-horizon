package middleware

import (
	"context"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

func PanicRecovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if r := recover(); r != nil {
				log.Printf("PANIC recovered: %v, path=%s", r, c.Request.URL.Path)
				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
					"error": "internal server error",
				})
			}
		}()
		c.Next()
	}
}

type visitor struct {
	requests    int
	lastSeen    time.Time
	windowStart time.Time
}

type RateLimiter struct {
	mu       sync.Mutex
	visitors map[string]*visitor
	rate     int
	burst    int
	ctx      context.Context
	cancel   context.CancelFunc
}

func NewRateLimiter(rate, burst int) *RateLimiter {
	ctx, cancel := context.WithCancel(context.Background())
	rl := &RateLimiter{
		visitors: make(map[string]*visitor),
		rate:     rate,
		burst:    burst,
		ctx:      ctx,
		cancel:   cancel,
	}
	go rl.cleanup()
	return rl
}

func (rl *RateLimiter) Stop() {
	rl.cancel()
}

func (rl *RateLimiter) Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()

		rl.mu.Lock()
		now := time.Now()
		v, exists := rl.visitors[ip]
		if !exists {
			v = &visitor{lastSeen: now, windowStart: now}
			rl.visitors[ip] = v
		}
		if now.Sub(v.windowStart) > 1*time.Minute {
			v.requests = 0
			v.windowStart = now
		}
		v.requests++
		v.lastSeen = now
		count := v.requests
		rl.mu.Unlock()

		if count > rl.burst {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "rate limit exceeded",
			})
			return
		}
		c.Next()
	}
}

func (rl *RateLimiter) cleanup() {
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()
	for {
		select {
		case <-rl.ctx.Done():
			return
		case <-ticker.C:
			rl.mu.Lock()
			for ip, v := range rl.visitors {
				if time.Since(v.lastSeen) > 1*time.Minute {
					delete(rl.visitors, ip)
				}
			}
			rl.mu.Unlock()
		}
	}
}
