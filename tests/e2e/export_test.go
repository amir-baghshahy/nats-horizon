package e2e

import (
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExport_StreamNotFound(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/export/streams/nonexistent"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusNotFound, resp.StatusCode)
}

func TestExportConsumer_NotFound(t *testing.T) {
	resp := doRequest(t, http.MethodGet,
		apiURL("/export/streams/nonexistent/consumers/nonexistent"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusNotFound, resp.StatusCode)
}

func TestExportMessages_MissingStream(t *testing.T) {
	body := map[string]interface{}{}
	resp := doRequest(t, http.MethodPost, apiURL("/export/streams/nonexistent/messages"), body)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusInternalServerError, resp.StatusCode)
}

func TestExportAllStreams(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/export/streams"), nil)
	requireStatus(t, resp, http.StatusOK)
	assert.NotEmpty(t, resp.Header.Get("Content-Type"))
}
