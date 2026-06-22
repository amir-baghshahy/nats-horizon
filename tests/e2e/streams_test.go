package e2e

import (
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestDeleteStreamMessage_InvalidSequence(t *testing.T) {
	resp := doRequest(t, http.MethodDelete,
		apiURL("/streams/test-stream/messages/abc"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}

func TestPurgeStream_NoBody(t *testing.T) {
	resp := doRequest(t, http.MethodPost, apiURL("/streams/test-stream/purge"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}

func TestUpdateStream_NotFound(t *testing.T) {
	body := map[string]interface{}{
		"subjects": []string{"test.>"},
	}
	resp := doRequest(t, http.MethodPut, apiURL("/streams/nonexistent"), body)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusNotFound, resp.StatusCode)
}

func TestDeleteStream_NotFound(t *testing.T) {
	resp := doRequest(t, http.MethodDelete, apiURL("/streams/nonexistent"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusNotFound, resp.StatusCode)
}

func TestPurgeStream_NotFound(t *testing.T) {
	body := map[string]interface{}{}
	resp := doRequest(t, http.MethodPost, apiURL("/streams/nonexistent/purge"), body)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusNotFound, resp.StatusCode)
}

func TestGetStream_NotFound(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/streams/nonexistent"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusNotFound, resp.StatusCode)
}

func TestStreamReplicas_NotFound(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/cluster/streams/nonexistent/replicas"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusNotFound, resp.StatusCode)
}

func TestDeleteStreamMessage_NotFound(t *testing.T) {
	resp := doRequest(t, http.MethodDelete,
		apiURL("/streams/nonexistent/messages/1"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusInternalServerError, resp.StatusCode)
}

func TestStream_FullLifecycle(t *testing.T) {
	ts := time.Now().UnixNano()
	streamName := "e2e-lifecycle-stream"

	createBody := map[string]interface{}{
		"name":     streamName,
		"subjects": []string{"e2e.test.>"},
		"storage":  "file",
	}
	createResp := doRequest(t, http.MethodPost, apiURL("/streams"), createBody)
	requireStatus(t, createResp, http.StatusCreated)

	var created map[string]interface{}
	decodeBody(t, createResp, &created)
	assert.Equal(t, streamName, created["config"].(map[string]interface{})["name"])

	getResp := doRequest(t, http.MethodGet, apiURL("/streams/"+streamName), nil)
	requireStatus(t, getResp, http.StatusOK)

	var got map[string]interface{}
	decodeBody(t, getResp, &got)
	assert.Equal(t, streamName, got["config"].(map[string]interface{})["name"])

	listResp := doRequest(t, http.MethodGet, apiURL("/streams"), nil)
	requireStatus(t, listResp, http.StatusOK)

	var streams []map[string]interface{}
	decodeBody(t, listResp, &streams)
	found := false
	for _, s := range streams {
		if s["config"].(map[string]interface{})["name"] == streamName {
			found = true
			break
		}
	}
	assert.True(t, found, "created stream should appear in list")

	updateBody := map[string]interface{}{
		"subjects": []string{"e2e.test.>", "e2e.test2.>"},
	}
	updateResp := doRequest(t, http.MethodPut, apiURL("/streams/"+streamName), updateBody)
	requireStatus(t, updateResp, http.StatusOK)

	var updated map[string]interface{}
	decodeBody(t, updateResp, &updated)
	updatedSubjects := updated["config"].(map[string]interface{})["subjects"].([]interface{})
	assert.Equal(t, 2, len(updatedSubjects), "update should change subjects count")

	purgeBody := map[string]interface{}{}
	purgeResp := doRequest(t, http.MethodPost, apiURL("/streams/"+streamName+"/purge"), purgeBody)
	requireStatus(t, purgeResp, http.StatusOK)

	delResp := doRequest(t, http.MethodDelete, apiURL("/streams/"+streamName), nil)
	requireStatus(t, delResp, http.StatusOK)

	notFoundResp := doRequest(t, http.MethodGet, apiURL("/streams/"+streamName), nil)
	defer notFoundResp.Body.Close()
	assert.Equal(t, http.StatusNotFound, notFoundResp.StatusCode)
	_ = ts
}
