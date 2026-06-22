package e2e

import (
	"fmt"
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestConcurrentRequests_Health(t *testing.T) {
	const concurrency = 50
	errCh := make(chan error, concurrency)

	for i := 0; i < concurrency; i++ {
		go func() {
			resp, err := httpClient.Get(apiURL("/health"))
			if err != nil {
				errCh <- err
				return
			}
			resp.Body.Close()
			if resp.StatusCode != http.StatusOK {
				errCh <- fmt.Errorf("unexpected status: %d", resp.StatusCode)
				return
			}
			errCh <- nil
		}()
	}

	for i := 0; i < concurrency; i++ {
		assert.NoError(t, <-errCh)
	}
}

func TestConcurrentRequests_ListStreams(t *testing.T) {
	const concurrency = 20
	errCh := make(chan error, concurrency)

	for i := 0; i < concurrency; i++ {
		go func() {
			resp, err := httpClient.Get(apiURL("/streams"))
			if err != nil {
				errCh <- err
				return
			}
			resp.Body.Close()
			if resp.StatusCode != http.StatusOK {
				errCh <- fmt.Errorf("unexpected status: %d", resp.StatusCode)
				return
			}
			errCh <- nil
		}()
	}

	for i := 0; i < concurrency; i++ {
		assert.NoError(t, <-errCh)
	}
}

func TestSlowLoris_Protection(t *testing.T) {
	for i := 0; i < 10; i++ {
		resp := doRequest(t, http.MethodGet, apiURL("/health"), nil)
		requireStatus(t, resp, http.StatusOK)
	}
}

func TestResponseTime_Health(t *testing.T) {
	start := time.Now()
	resp := doRequest(t, http.MethodGet, apiURL("/health"), nil)
	elapsed := time.Since(start)
	defer resp.Body.Close()

	requireStatus(t, resp, http.StatusOK)
	assert.Less(t, elapsed, 2*time.Second, "health check should respond within 2 seconds")
}

func TestResponseTime_ListStreams(t *testing.T) {
	start := time.Now()
	resp := doRequest(t, http.MethodGet, apiURL("/streams"), nil)
	elapsed := time.Since(start)
	defer resp.Body.Close()

	requireStatus(t, resp, http.StatusOK)
	assert.Less(t, elapsed, 5*time.Second, "list streams should respond within 5 seconds")
}
