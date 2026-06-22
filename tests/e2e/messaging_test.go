package e2e

import (
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestSubscribe_InternalSubject_Rejected(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/core/subscribe?subject=$SYS.FOO"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}

func TestSubscribe_JSInternalSubject_Rejected(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/core/subscribe?subject=$JS.FOO"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}

func TestSubscribe_MissingSubject(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/core/subscribe"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}

func TestMonitor_MissingSubjects(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/core/monitor"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}
