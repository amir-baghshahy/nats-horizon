package e2e

import (
	"fmt"
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestPublishMessage_MissingSubject(t *testing.T) {
	body := map[string]interface{}{"payload": "hello"}
	resp := doRequest(t, http.MethodPost, apiURL("/core/publish"), body)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}

func TestPublishMessage_EmptyStream(t *testing.T) {
	body := map[string]interface{}{
		"subject": "test.hello",
		"payload": "hello",
	}
	resp := doRequest(t, http.MethodPost,
		apiURL("/streams/nonexistent/messages/publish"), body)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusInternalServerError, resp.StatusCode)
}

func TestPublishAndReadMessage(t *testing.T) {
	ts := time.Now().UnixNano()
	streamName := "e2e-publish-stream"

	createBody := map[string]interface{}{
		"name":     streamName,
		"subjects": []string{"e2e.pub.>"},
		"storage":  "file",
	}
	createResp := doRequest(t, http.MethodPost, apiURL("/streams"), createBody)
	requireStatus(t, createResp, http.StatusCreated)

	publishBody := map[string]interface{}{
		"subject": "e2e.pub.test",
		"payload": "hello-e2e",
	}
	pubResp := doRequest(t, http.MethodPost,
		apiURL("/streams/"+streamName+"/messages/publish"), publishBody)
	requireStatus(t, pubResp, http.StatusOK)

	messagesResp := doRequest(t, http.MethodGet,
		apiURL("/messages?stream="+streamName+"&limit=10"), nil)
	requireStatus(t, messagesResp, http.StatusOK)

	var messages struct {
		Messages []map[string]interface{} `json:"messages"`
		Total    int                      `json:"total"`
	}
	decodeBody(t, messagesResp, &messages)
	assert.Greater(t, messages.Total, 0)

	delResp := doRequest(t, http.MethodDelete, apiURL("/streams/"+streamName), nil)
	requireStatus(t, delResp, http.StatusOK)
	_ = ts
}

func TestDeleteMessage(t *testing.T) {
	ts := time.Now().UnixNano()
	streamName := "e2e-delmsg-stream"

	createBody := map[string]interface{}{
		"name":     streamName,
		"subjects": []string{"e2e.delmsg.>"},
		"storage":  "file",
	}
	createResp := doRequest(t, http.MethodPost, apiURL("/streams"), createBody)
	requireStatus(t, createResp, http.StatusCreated)

	publishBody := map[string]interface{}{
		"subject": "e2e.delmsg.test",
		"payload": "to-delete",
	}
	pubResp := doRequest(t, http.MethodPost,
		apiURL("/streams/"+streamName+"/messages/publish"), publishBody)
	requireStatus(t, pubResp, http.StatusOK)

	messagesResp := doRequest(t, http.MethodGet,
		apiURL("/messages?stream="+streamName+"&limit=1"), nil)
	requireStatus(t, messagesResp, http.StatusOK)

	var messages struct {
		Messages []map[string]interface{} `json:"messages"`
	}
	decodeBody(t, messagesResp, &messages)
	require.Greater(t, len(messages.Messages), 0)

	seq := messages.Messages[0]["sequence"].(float64)
	delResp := doRequest(t, http.MethodDelete,
		apiURL("/streams/"+streamName+"/messages/"+fmt.Sprintf("%d", int64(seq))), nil)
	requireStatus(t, delResp, http.StatusOK)

	delStreamResp := doRequest(t, http.MethodDelete, apiURL("/streams/"+streamName), nil)
	requireStatus(t, delStreamResp, http.StatusOK)
	_ = ts
}
