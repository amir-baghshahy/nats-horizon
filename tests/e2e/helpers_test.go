package e2e

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"testing"
	"time"
)

var (
	baseURL    string
	httpClient *http.Client
)

func TestMain(m *testing.M) {
	baseURL = getEnv("TEST_BASE_URL", "http://localhost:3000")
	httpClient = &http.Client{
		Timeout: 10 * time.Second,
	}

	waitForServer(baseURL, 30*time.Second)

	os.Exit(m.Run())
}

func waitForServer(url string, timeout time.Duration) {
	deadline := time.Now().Add(timeout)
	for time.Now().Before(deadline) {
		resp, err := httpClient.Get(url + "/api/health")
		if err == nil {
			resp.Body.Close()
			if resp.StatusCode == http.StatusOK || resp.StatusCode == http.StatusServiceUnavailable {
				return
			}
		}
		time.Sleep(500 * time.Millisecond)
	}
	panic(fmt.Sprintf("server at %s did not become ready within %s", url, timeout))
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func apiURL(path string) string {
	return baseURL + "/api" + path
}

func doRequest(t *testing.T, method, url string, body interface{}) *http.Response {
	t.Helper()

	var bodyReader io.Reader
	if body != nil {
		switch v := body.(type) {
		case string:
			bodyReader = strings.NewReader(v)
		case []byte:
			bodyReader = strings.NewReader(string(v))
		default:
			b, err := json.Marshal(body)
			if err != nil {
				t.Fatalf("failed to marshal body: %v", err)
			}
			bodyReader = strings.NewReader(string(b))
		}
	}

	req, err := http.NewRequest(method, url, bodyReader)
	if err != nil {
		t.Fatalf("failed to create request: %v", err)
	}
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	resp, err := httpClient.Do(req)
	if err != nil {
		t.Fatalf("failed to do request: %v", err)
	}
	return resp
}

func decodeBody(t *testing.T, resp *http.Response, target interface{}) {
	t.Helper()
	defer resp.Body.Close()
	if err := json.NewDecoder(resp.Body).Decode(target); err != nil {
		t.Fatalf("failed to decode body: %v", err)
	}
}

func readBody(t *testing.T, resp *http.Response) string {
	t.Helper()
	defer resp.Body.Close()
	b, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("failed to read body: %v", err)
	}
	return string(b)
}

func requireStatus(t *testing.T, resp *http.Response, expected int) {
	t.Helper()
	if resp.StatusCode != expected {
		body := readBody(t, resp)
		t.Fatalf("expected status %d, got %d. body: %s", expected, resp.StatusCode, body)
	}
}
