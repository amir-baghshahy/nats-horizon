package e2e

import (
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestRequestMessage_MissingSubject(t *testing.T) {
	body := map[string]interface{}{"payload": "hello"}
	resp := doRequest(t, http.MethodPost, apiURL("/core/request"), body)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}

func TestListStreams_Empty(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/streams"), nil)
	requireStatus(t, resp, http.StatusOK)

	var body []map[string]interface{}
	decodeBody(t, resp, &body)
	assert.NotNil(t, body)
}
