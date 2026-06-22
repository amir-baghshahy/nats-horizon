package e2e

import (
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestConsumerMetrics_NotFound(t *testing.T) {
	resp := doRequest(t, http.MethodGet,
		apiURL("/metrics/streams/nonexistent/consumers/nonexistent"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusNotFound, resp.StatusCode)
}

func TestGetConsumer_NotFound(t *testing.T) {
	resp := doRequest(t, http.MethodGet,
		apiURL("/streams/test-stream/consumers/nonexistent"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusNotFound, resp.StatusCode)
}

func TestCreateConsumer_MissingName(t *testing.T) {
	body := map[string]interface{}{}
	resp := doRequest(t, http.MethodPost,
		apiURL("/streams/test-stream/consumers"), body)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}

func TestUpdateConsumer_NotFound(t *testing.T) {
	body := map[string]interface{}{
		"ack_policy": "explicit",
	}
	resp := doRequest(t, http.MethodPut,
		apiURL("/streams/test-stream/consumers/nonexistent"), body)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusInternalServerError, resp.StatusCode)
}

func TestDeleteConsumer_NotFound(t *testing.T) {
	resp := doRequest(t, http.MethodDelete,
		apiURL("/streams/test-stream/consumers/nonexistent"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusInternalServerError, resp.StatusCode)
}

func TestGetConsumerByName_NotFound(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/consumers/nonexistent"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusNotFound, resp.StatusCode)
}

func TestListAllConsumers_Empty(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/consumers"), nil)
	requireStatus(t, resp, http.StatusOK)

	var body []map[string]interface{}
	decodeBody(t, resp, &body)
	assert.NotNil(t, body)
}

func TestConsumer_FullLifecycle(t *testing.T) {
	ts := time.Now().UnixNano()
	streamName := "e2e-consumer-stream"
	consumerName := "e2e-consumer"

	createStreamBody := map[string]interface{}{
		"name":     streamName,
		"subjects": []string{"e2e.consumer.>"},
		"storage":  "file",
	}
	streamResp := doRequest(t, http.MethodPost, apiURL("/streams"), createStreamBody)
	requireStatus(t, streamResp, http.StatusCreated)

	createConsumerBody := map[string]interface{}{
		"name":       consumerName,
		"durable":    consumerName,
		"ack_policy": "explicit",
	}
	consumerResp := doRequest(t, http.MethodPost,
		apiURL("/streams/"+streamName+"/consumers"), createConsumerBody)
	requireStatus(t, consumerResp, http.StatusCreated)

	var created map[string]interface{}
	decodeBody(t, consumerResp, &created)
	assert.Equal(t, consumerName, created["name"])

	getResp := doRequest(t, http.MethodGet,
		apiURL("/streams/"+streamName+"/consumers/"+consumerName), nil)
	requireStatus(t, getResp, http.StatusOK)

	var got map[string]interface{}
	decodeBody(t, getResp, &got)
	assert.Equal(t, consumerName, got["name"])

	consumersResp := doRequest(t, http.MethodGet,
		apiURL("/streams/"+streamName+"/consumers"), nil)
	requireStatus(t, consumersResp, http.StatusOK)

	pendingResp := doRequest(t, http.MethodGet,
		apiURL("/streams/"+streamName+"/consumers/"+consumerName+"/pending"), nil)
	requireStatus(t, pendingResp, http.StatusOK)

	pauseResp := doRequest(t, http.MethodPost,
		apiURL("/streams/"+streamName+"/consumers/"+consumerName+"/pause"), nil)
	requireStatus(t, pauseResp, http.StatusOK)

	pausedGetResp := doRequest(t, http.MethodGet,
		apiURL("/streams/"+streamName+"/consumers/"+consumerName), nil)
	requireStatus(t, pausedGetResp, http.StatusOK)

	var paused map[string]interface{}
	decodeBody(t, pausedGetResp, &paused)
	assert.Equal(t, true, paused["paused"])

	resumeResp := doRequest(t, http.MethodPost,
		apiURL("/streams/"+streamName+"/consumers/"+consumerName+"/resume"), nil)
	requireStatus(t, resumeResp, http.StatusOK)

	resetBody := map[string]interface{}{"sequence": 0}
	resetResp := doRequest(t, http.MethodPost,
		apiURL("/streams/"+streamName+"/consumers/"+consumerName+"/lag-reset"), resetBody)
	requireStatus(t, resetResp, http.StatusOK)

	replayBody := map[string]interface{}{}
	replayResp := doRequest(t, http.MethodPost,
		apiURL("/streams/"+streamName+"/consumers/"+consumerName+"/replay"), replayBody)
	requireStatus(t, replayResp, http.StatusOK)

	delConsumerResp := doRequest(t, http.MethodDelete,
		apiURL("/streams/"+streamName+"/consumers/"+consumerName), nil)
	requireStatus(t, delConsumerResp, http.StatusOK)

	delStreamResp := doRequest(t, http.MethodDelete, apiURL("/streams/"+streamName), nil)
	requireStatus(t, delStreamResp, http.StatusOK)
	_ = ts
}
