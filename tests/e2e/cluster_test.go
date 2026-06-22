package e2e

import (
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCluster_Info(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/cluster/info"), nil)
	requireStatus(t, resp, http.StatusOK)

	var body map[string]interface{}
	decodeBody(t, resp, &body)
	assert.NotNil(t, body)
}

func TestCluster_Nodes(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/cluster/nodes"), nil)
	requireStatus(t, resp, http.StatusOK)

	var body map[string]interface{}
	decodeBody(t, resp, &body)
	assert.NotNil(t, body)
}

func TestCluster_Health(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/cluster/health"), nil)
	requireStatus(t, resp, http.StatusOK)

	var body map[string]interface{}
	decodeBody(t, resp, &body)
	assert.NotNil(t, body)
}
