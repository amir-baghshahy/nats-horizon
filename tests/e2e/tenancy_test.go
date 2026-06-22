package e2e

import (
	"encoding/json"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestTenancy_ListConnections(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/tenancy/connections"), nil)
	requireStatus(t, resp, http.StatusOK)

	var body struct {
		Connections []map[string]any `json:"connections"`
		Count       int              `json:"count"`
	}
	decodeBody(t, resp, &body)

	assert.GreaterOrEqual(t, body.Count, 0)
	assert.NotNil(t, body.Connections)
}

func TestTenancy_GetDefaultConnection(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/tenancy/connections/default"), nil)
	requireStatus(t, resp, http.StatusOK)

	var body map[string]interface{}
	decodeBody(t, resp, &body)

	assert.Equal(t, "default", body["id"])
	assert.Equal(t, true, body["is_default"])
}

func TestTenancy_ConnectionStatus(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/tenancy/status"), nil)
	requireStatus(t, resp, http.StatusOK)

	var body struct {
		Statuses []map[string]interface{} `json:"statuses"`
		Count    int                      `json:"count"`
	}
	decodeBody(t, resp, &body)

	assert.GreaterOrEqual(t, body.Count, 0)
	assert.NotNil(t, body.Statuses)
}

func TestTenancy_TestConnection(t *testing.T) {
	natsURL := getEnv("NATS_URL", "nats://localhost:4222")
	body := map[string]interface{}{"url": natsURL}
	resp := doRequest(t, http.MethodPost, apiURL("/tenancy/connections/test"), body)
	requireStatus(t, resp, http.StatusOK)

	var result struct {
		Connected bool   `json:"connected"`
		Healthy   bool   `json:"healthy"`
		Latency   string `json:"latency"`
	}
	decodeBody(t, resp, &result)

	assert.True(t, result.Connected)
	assert.True(t, result.Healthy)
	assert.NotEmpty(t, result.Latency)
}

func TestTenancy_CreateConnection(t *testing.T) {
	natsURL := getEnv("NATS_URL", "nats://localhost:4222")
	body := map[string]interface{}{
		"name":        "e2e-test-connection",
		"url":         natsURL,
		"description": "E2E test connection",
	}
	resp := doRequest(t, http.MethodPost, apiURL("/tenancy/connections"), body)
	requireStatus(t, resp, http.StatusCreated)

	var result map[string]interface{}
	decodeBody(t, resp, &result)

	assert.NotEmpty(t, result["id"])
	assert.Equal(t, "e2e-test-connection", result["name"])
	assert.Equal(t, natsURL, result["url"])
	assert.Equal(t, "E2E test connection", result["description"])

	cleanupURL := apiURL("/tenancy/connections/" + result["id"].(string))
	cleanupResp := doRequest(t, http.MethodDelete, cleanupURL, nil)
	requireStatus(t, cleanupResp, http.StatusOK)
}

func TestTenancy_CreateConnection_InvalidURL(t *testing.T) {
	body := map[string]interface{}{
		"name": "bad-url",
		"url":  "http://not-nats:4222",
	}
	resp := doRequest(t, http.MethodPost, apiURL("/tenancy/connections"), body)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}

func TestTenancy_CreateConnection_MissingFields(t *testing.T) {
	body := map[string]interface{}{"name": "incomplete"}
	resp := doRequest(t, http.MethodPost, apiURL("/tenancy/connections"), body)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}

func TestTenancy_DeleteDefault_Forbidden(t *testing.T) {
	resp := doRequest(t, http.MethodDelete, apiURL("/tenancy/connections/default"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}

func TestTenancy_GetNonExistent(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/tenancy/connections/does-not-exist"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusNotFound, resp.StatusCode)
}

func TestTenancy_UpdateNonExistent(t *testing.T) {
	body := map[string]interface{}{"name": "updated"}
	resp := doRequest(t, http.MethodPut, apiURL("/tenancy/connections/does-not-exist"), body)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusNotFound, resp.StatusCode)
}

func TestTenancy_DeleteNonExistent(t *testing.T) {
	resp := doRequest(t, http.MethodDelete, apiURL("/tenancy/connections/does-not-exist"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusNotFound, resp.StatusCode)
}

func TestUsers_NotImplemented(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/security/users"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusNotImplemented, resp.StatusCode)
}

func TestCreateUser_NotImplemented(t *testing.T) {
	body := map[string]interface{}{"name": "test"}
	resp := doRequest(t, http.MethodPost, apiURL("/security/users"), body)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusNotImplemented, resp.StatusCode)
}

func TestUpdateUser_NotImplemented(t *testing.T) {
	body := map[string]interface{}{"name": "test"}
	resp := doRequest(t, http.MethodPut, apiURL("/security/users/test"), body)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusNotImplemented, resp.StatusCode)
}

func TestDeleteUser_NotImplemented(t *testing.T) {
	resp := doRequest(t, http.MethodDelete, apiURL("/security/users/test"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusNotImplemented, resp.StatusCode)
}

func TestTenancy_SetDefault_NonExistent(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/tenancy/connections/does-not-exist/default"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusNotFound, resp.StatusCode)
}

func TestTenancy_TestConnection_InvalidURL(t *testing.T) {
	body := map[string]interface{}{"url": "not-a-url"}
	resp := doRequest(t, http.MethodPost, apiURL("/tenancy/connections/test"), body)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}

func TestTenancy_TestConnection_Unreachable(t *testing.T) {
	body := map[string]interface{}{"url": "nats://192.0.2.1:4222"}
	resp := doRequest(t, http.MethodPost, apiURL("/tenancy/connections/test"), body)
	requireStatus(t, resp, http.StatusOK)

	var result struct {
		Connected bool   `json:"connected"`
		Error     string `json:"error"`
	}
	decodeBody(t, resp, &result)

	assert.False(t, result.Connected)
	assert.NotEmpty(t, result.Error)
	assert.Contains(t, result.Error, "timeout")
}

func TestTenancy_CreateConnection_DuplicateName(t *testing.T) {
	natsURL := getEnv("NATS_URL", "nats://localhost:4222")
	body := map[string]interface{}{
		"name": "default",
		"url":  natsURL,
	}
	resp := doRequest(t, http.MethodPost, apiURL("/tenancy/connections"), body)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusCreated, resp.StatusCode)

	if resp.StatusCode == http.StatusCreated {
		var result map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&result)
		cleanupURL := apiURL("/tenancy/connections/" + result["id"].(string))
		cleanupResp := doRequest(t, http.MethodDelete, cleanupURL, nil)
		cleanupResp.Body.Close()
	}
}

func TestTenancy_UpdateConnection(t *testing.T) {
	natsURL := getEnv("NATS_URL", "nats://localhost:4222")
	body := map[string]interface{}{
		"name": "e2e-update-test",
		"url":  natsURL,
	}
	resp := doRequest(t, http.MethodPost, apiURL("/tenancy/connections"), body)
	requireStatus(t, resp, http.StatusCreated)

	var created map[string]interface{}
	decodeBody(t, resp, &created)
	id := created["id"].(string)

	updateBody := map[string]interface{}{
		"name":        "e2e-updated",
		"description": "updated description",
	}
	updateResp := doRequest(t, http.MethodPut, apiURL("/tenancy/connections/"+id), updateBody)
	requireStatus(t, updateResp, http.StatusOK)

	var updated map[string]interface{}
	decodeBody(t, updateResp, &updated)
	assert.Equal(t, "e2e-updated", updated["name"])
	assert.Equal(t, "updated description", updated["description"])

	cleanupResp := doRequest(t, http.MethodDelete, apiURL("/tenancy/connections/"+id), nil)
	requireStatus(t, cleanupResp, http.StatusOK)
}

func TestTenancy_DeleteConnection(t *testing.T) {
	natsURL := getEnv("NATS_URL", "nats://localhost:4222")
	body := map[string]interface{}{
		"name": "e2e-delete-test",
		"url":  natsURL,
	}
	resp := doRequest(t, http.MethodPost, apiURL("/tenancy/connections"), body)
	requireStatus(t, resp, http.StatusCreated)

	var created map[string]interface{}
	decodeBody(t, resp, &created)
	id := created["id"].(string)

	delResp := doRequest(t, http.MethodDelete, apiURL("/tenancy/connections/"+id), nil)
	requireStatus(t, delResp, http.StatusOK)

	getResp := doRequest(t, http.MethodGet, apiURL("/tenancy/connections/"+id), nil)
	defer getResp.Body.Close()
	assert.Equal(t, http.StatusNotFound, getResp.StatusCode)
}
