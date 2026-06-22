package e2e

import (
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestAckMessage_InvalidSequence(t *testing.T) {
	body := map[string]interface{}{"sequence": 0}
	resp := doRequest(t, http.MethodPost,
		apiURL("/streams/test-stream/consumers/test-consumer/ack"), body)
	defer resp.Body.Close()
	assert.Contains(t, []int{http.StatusBadRequest, http.StatusInternalServerError}, resp.StatusCode)
}

func TestNackMessage_MissingSequence(t *testing.T) {
	body := map[string]interface{}{}
	resp := doRequest(t, http.MethodPost,
		apiURL("/streams/test-stream/consumers/test-consumer/nack"), body)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}

func TestTermMessage_MissingSequence(t *testing.T) {
	body := map[string]interface{}{}
	resp := doRequest(t, http.MethodPost,
		apiURL("/streams/test-stream/consumers/test-consumer/term"), body)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}

func TestResetLag_MissingConsumer(t *testing.T) {
	body := map[string]interface{}{"sequence": 0}
	resp := doRequest(t, http.MethodPost,
		apiURL("/streams/test-stream/consumers/nonexistent/lag-reset"), body)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusInternalServerError, resp.StatusCode)
}

func TestReplay_MissingConsumer(t *testing.T) {
	body := map[string]interface{}{}
	resp := doRequest(t, http.MethodPost,
		apiURL("/streams/test-stream/consumers/nonexistent/replay"), body)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusInternalServerError, resp.StatusCode)
}

func TestPause_MissingConsumer(t *testing.T) {
	resp := doRequest(t, http.MethodPost,
		apiURL("/streams/test-stream/consumers/nonexistent/pause"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusInternalServerError, resp.StatusCode)
}

func TestResume_MissingConsumer(t *testing.T) {
	resp := doRequest(t, http.MethodPost,
		apiURL("/streams/test-stream/consumers/nonexistent/resume"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusInternalServerError, resp.StatusCode)
}

func TestGetPendingMessages_MissingConsumer(t *testing.T) {
	resp := doRequest(t, http.MethodGet,
		apiURL("/streams/test-stream/consumers/nonexistent/pending"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusInternalServerError, resp.StatusCode)
}

func TestAckMessage_MissingConsumer(t *testing.T) {
	body := map[string]interface{}{"sequence": 1}
	resp := doRequest(t, http.MethodPost,
		apiURL("/streams/test-stream/consumers/nonexistent/ack"), body)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusInternalServerError, resp.StatusCode)
}

func TestNackMessage_MissingConsumer(t *testing.T) {
	body := map[string]interface{}{"sequence": 1}
	resp := doRequest(t, http.MethodPost,
		apiURL("/streams/test-stream/consumers/nonexistent/nack"), body)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusInternalServerError, resp.StatusCode)
}

func TestTermMessage_MissingConsumer(t *testing.T) {
	body := map[string]interface{}{"sequence": 1}
	resp := doRequest(t, http.MethodPost,
		apiURL("/streams/test-stream/consumers/nonexistent/term"), body)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusInternalServerError, resp.StatusCode)
}

func TestTerminateConnection_InvalidID(t *testing.T) {
	resp := doRequest(t, http.MethodDelete, apiURL("/connections/abc"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusInternalServerError, resp.StatusCode)
}

func TestTerminateConnection_NonExistent(t *testing.T) {
	resp := doRequest(t, http.MethodDelete, apiURL("/connections/999999999"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusInternalServerError, resp.StatusCode)
}
