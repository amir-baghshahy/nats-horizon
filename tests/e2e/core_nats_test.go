package e2e

import (
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCoreNATS_PublishAndRequest(t *testing.T) {
	publishBody := map[string]interface{}{
		"subject": "e2e.core.test",
		"payload": "hello-core",
	}
	pubResp := doRequest(t, http.MethodPost, apiURL("/core/publish"), publishBody)
	requireStatus(t, pubResp, http.StatusOK)

	var pubResult struct {
		Success bool   `json:"success"`
		Subject string `json:"subject"`
	}
	decodeBody(t, pubResp, &pubResult)
	assert.True(t, pubResult.Success)
	assert.Equal(t, "e2e.core.test", pubResult.Subject)
}

func TestCoreNATS_Publish_EmptyPayload(t *testing.T) {
	body := map[string]interface{}{
		"subject": "e2e.core.empty",
		"payload": "",
	}
	resp := doRequest(t, http.MethodPost, apiURL("/core/publish"), body)
	requireStatus(t, resp, http.StatusOK)
}

func TestCoreNATS_Publish_WithHeaders(t *testing.T) {
	body := map[string]interface{}{
		"subject": "e2e.core.headers",
		"payload": "with-headers",
		"headers": map[string][]string{
			"X-Test": {"value1", "value2"},
		},
	}
	resp := doRequest(t, http.MethodPost, apiURL("/core/publish"), body)
	requireStatus(t, resp, http.StatusOK)
}

func TestCoreNATS_Publish_LargePayload(t *testing.T) {
	largePayload := make([]byte, 1024*1024)
	for i := range largePayload {
		largePayload[i] = byte('A')
	}
	body := map[string]interface{}{
		"subject": "e2e.core.large",
		"payload": string(largePayload),
	}
	resp := doRequest(t, http.MethodPost, apiURL("/core/publish"), body)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusOK, resp.StatusCode)
}
