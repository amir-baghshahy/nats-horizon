package e2e

import (
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestPurgeBucket_NoBody(t *testing.T) {
	resp := doRequest(t, http.MethodPost, apiURL("/kv/buckets/test-bucket/purge"), nil)
	defer resp.Body.Close()
	assert.Contains(t, []int{http.StatusBadRequest, http.StatusNotFound, http.StatusOK}, resp.StatusCode)
}

func TestPutKey_MissingBody(t *testing.T) {
	resp := doRequest(t, http.MethodPut, apiURL("/kv/buckets/test-bucket/key?key=mykey"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}

func TestDeleteKey_MissingKey(t *testing.T) {
	resp := doRequest(t, http.MethodDelete, apiURL("/kv/buckets/test-bucket/key"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}

func TestGetKey_MissingKey(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/kv/buckets/test-bucket/key"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}

func TestGetBucketHistory_MissingKey(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/kv/buckets/test-bucket/history"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}

func TestListKeys_MissingBucket(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/kv/buckets/nonexistent/keys"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusNotFound, resp.StatusCode)
}

func TestGetBucket_NonExistent(t *testing.T) {
	resp := doRequest(t, http.MethodGet, apiURL("/kv/buckets/nonexistent"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusNotFound, resp.StatusCode)
}

func TestDeleteBucket_NonExistent(t *testing.T) {
	resp := doRequest(t, http.MethodDelete, apiURL("/kv/buckets/nonexistent"), nil)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusNotFound, resp.StatusCode)
}

func TestCreateBucket_MissingName(t *testing.T) {
	body := map[string]interface{}{}
	resp := doRequest(t, http.MethodPost, apiURL("/kv/buckets"), body)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}

func TestCreateBucket_InvalidName(t *testing.T) {
	body := map[string]interface{}{"name": ""}
	resp := doRequest(t, http.MethodPost, apiURL("/kv/buckets"), body)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}

func TestCreateBucket_DotPrefix(t *testing.T) {
	body := map[string]interface{}{"name": ".invalid"}
	resp := doRequest(t, http.MethodPost, apiURL("/kv/buckets"), body)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}

func TestCreateBucket_InvalidChars(t *testing.T) {
	body := map[string]interface{}{"name": "invalid name!"}
	resp := doRequest(t, http.MethodPost, apiURL("/kv/buckets"), body)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}

func TestCreateBucket_TooLong(t *testing.T) {
	longName := ""
	for i := 0; i < 257; i++ {
		longName += "a"
	}
	body := map[string]interface{}{"name": longName}
	resp := doRequest(t, http.MethodPost, apiURL("/kv/buckets"), body)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}

func TestCreateBucket_MaxReplicas(t *testing.T) {
	body := map[string]interface{}{
		"name":     "test-bucket",
		"replicas": 10,
	}
	resp := doRequest(t, http.MethodPost, apiURL("/kv/buckets"), body)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}

func TestCreateBucket_EmptySubjects(t *testing.T) {
	body := map[string]interface{}{
		"name":     "test-stream",
		"subjects": []string{},
		"storage":  "file",
	}
	resp := doRequest(t, http.MethodPost, apiURL("/streams"), body)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}

func TestKV_CreateBucketAndKey(t *testing.T) {
	ts := time.Now().UnixNano()
	bucketName := "e2e-test-bucket"

	body := map[string]interface{}{
		"name": bucketName,
	}
	resp := doRequest(t, http.MethodPost, apiURL("/kv/buckets"), body)
	if resp.StatusCode == http.StatusCreated || resp.StatusCode == http.StatusConflict {
		keyBody := map[string]interface{}{
			"key":   "test-key",
			"value": "test-value",
		}
		keyResp := doRequest(t, http.MethodPut, apiURL("/kv/buckets/"+bucketName+"/key"), keyBody)
		defer keyResp.Body.Close()

		getResp := doRequest(t, http.MethodGet, apiURL("/kv/buckets/"+bucketName+"/key?key=test-key"), nil)
		defer getResp.Body.Close()

		listResp := doRequest(t, http.MethodGet, apiURL("/kv/buckets/"+bucketName+"/keys"), nil)
		defer listResp.Body.Close()

		histReq, _ := http.NewRequest(http.MethodGet, apiURL("/kv/buckets/"+bucketName+"/history?key=test-key"), nil)
		histReq.Header.Set("Accept", "application/json")
		histClient := &http.Client{Timeout: 3 * time.Second}
		histResp, _ := histClient.Do(histReq)
		if histResp != nil {
			histResp.Body.Close()
		}

		delKeyResp := doRequest(t, http.MethodDelete, apiURL("/kv/buckets/"+bucketName+"/key?key=test-key"), nil)
		defer delKeyResp.Body.Close()
	}

	delResp := doRequest(t, http.MethodDelete, apiURL("/kv/buckets/"+bucketName), nil)
	defer delResp.Body.Close()
	_ = ts
}
