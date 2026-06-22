package e2e

import (
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestMetrics_StreamNotFound(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/metrics/streams/nonexistent"), nil)
	defer resp.Body.Close()
	assert.Contains(t, []int{http.StatusNotFound, http.StatusOK}, resp.StatusCode)
}

func TestMetrics_Filtered(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/metrics?type=messages&duration=1h"), nil)
	requireStatus(t, resp, http.StatusOK)

	var body map[string]interface{}
	decodeBody(t, resp, &body)
	assert.NotNil(t, body["streams"])
}

func TestMetrics_InvalidDuration(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/metrics?duration=invalid"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusOK, resp.StatusCode)
}

func TestMetrics_InvalidStream(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/metrics?stream=nonexistent&type=messages"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusOK, resp.StatusCode)
}
