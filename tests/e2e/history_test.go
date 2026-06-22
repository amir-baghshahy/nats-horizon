package e2e

import (
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestHistory_StreamNotFound(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/history/streams/nonexistent"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusOK, resp.StatusCode)
}

func TestHistory_Analysis_StreamNotFound(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/history/streams/nonexistent/analysis"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusOK, resp.StatusCode)
}

func TestHistory_Report(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/history/report"), nil)
	requireStatus(t, resp, http.StatusOK)

	var body map[string]interface{}
	decodeBody(t, resp, &body)

	assert.NotNil(t, body["streams"])
	assert.NotNil(t, body["generated_at"])
}

func TestHistory_InvalidDuration(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/history/streams/test?duration=invalid"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusOK, resp.StatusCode)
}

func TestHistory_Analysis_InvalidDuration(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/history/streams/test/analysis?duration=invalid"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusOK, resp.StatusCode)
}

func TestHistory_Report_InvalidDuration(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/history/report?duration=invalid"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusOK, resp.StatusCode)
}
