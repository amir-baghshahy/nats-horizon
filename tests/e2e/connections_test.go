package e2e

import (
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestConnections(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/connections"), nil)
	requireStatus(t, resp, http.StatusOK)

	var body struct {
		Connections []map[string]interface{} `json:"connections"`
		Total       int                      `json:"total"`
	}
	decodeBody(t, resp, &body)

	assert.GreaterOrEqual(t, body.Total, 0)
	assert.NotNil(t, body.Connections)
}
