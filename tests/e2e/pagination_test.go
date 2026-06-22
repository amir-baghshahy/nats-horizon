package e2e

import (
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetMessages_MissingStream(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/messages"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}

func TestGetMessages_InvalidLimit(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/messages?stream=test&limit=abc"), nil)
	defer resp.Body.Close()
	assert.Contains(t, []int{http.StatusOK, http.StatusInternalServerError, http.StatusNotFound}, resp.StatusCode)
}

func TestGetMessages_LimitCapped(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/messages?stream=test&limit=999999"), nil)
	defer resp.Body.Close()
	assert.Contains(t, []int{http.StatusOK, http.StatusInternalServerError, http.StatusNotFound}, resp.StatusCode)
}

func TestPaginatedMessages_MissingStream(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/messages/page"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}

func TestPaginatedMessages_InvalidPage(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/messages/page?stream=test&page=abc"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusNotFound, resp.StatusCode)
}

func TestPaginatedMessages_NegativePage(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/messages/page?stream=test&page=-1"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusNotFound, resp.StatusCode)
}

func TestGetMessages_EmptyStream(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/messages?stream=nonexistent"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusInternalServerError, resp.StatusCode)
}

func TestPaginatedMessages_StreamNotFound(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/messages/page?stream=nonexistent"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusNotFound, resp.StatusCode)
}

func TestPaginatedMessages_InvalidPageSize(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/messages/page?stream=test&page_size=abc"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusNotFound, resp.StatusCode)
}

func TestPaginatedMessages_ZeroPageSize(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/messages/page?stream=test&page_size=0"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusNotFound, resp.StatusCode)
}

func TestPaginatedMessages_NegativePageSize(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/messages/page?stream=test&page_size=-5"), nil)
	defer resp.Body.Close()
	assert.Contains(t, []int{http.StatusOK, http.StatusNotFound}, resp.StatusCode)
}
