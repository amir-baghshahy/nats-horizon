package services

import (
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestSanitizeHeader(t *testing.T) {
	tests := []struct {
		input string
		want  string
	}{
		{"normal@example.com", "normal@example.com"},
		{"user\r\nBCC: victim@evil.com", "userBCC: victim@evil.com"},
		{"user\nBCC: victim@evil.com", "userBCC: victim@evil.com"},
		{"user\rBCC: victim@evil.com", "userBCC: victim@evil.com"},
		{"", ""},
		{"no-crlf", "no-crlf"},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			got := sanitizeHeader(tt.input)
			assert.Equal(t, tt.want, got)
			assert.NotContains(t, got, "\r")
			assert.NotContains(t, got, "\n")
		})
	}
}

func TestSanitizeHeader_PreservesContent(t *testing.T) {
	input := "admin@example.com"
	got := sanitizeHeader(input)
	assert.Equal(t, input, got)
}

func TestGetStringConfig(t *testing.T) {
	config := map[string]interface{}{
		"key":    "value",
		"number": 42,
		"bool":   true,
	}

	assert.Equal(t, "value", getStringConfig(config, "key", "default"))
	assert.Equal(t, "default", getStringConfig(config, "missing", "default"))
	assert.Equal(t, "default", getStringConfig(config, "number", "default"))
	assert.Equal(t, "default", getStringConfig(config, "bool", "default"))
}

func TestGetIntConfig(t *testing.T) {
	config := map[string]interface{}{
		"int":    42,
		"float":  3.14,
		"string": "hello",
	}

	assert.Equal(t, 42, getIntConfig(config, "int", 0))
	assert.Equal(t, 3, getIntConfig(config, "float", 0))
	assert.Equal(t, 0, getIntConfig(config, "string", 0))
	assert.Equal(t, 99, getIntConfig(config, "missing", 99))
}

func TestGetBoolConfig(t *testing.T) {
	config := map[string]interface{}{
		"bool":   true,
		"int":    1,
		"string": "hello",
	}

	assert.True(t, getBoolConfig(config, "bool", false))
	assert.False(t, getBoolConfig(config, "int", false))
	assert.False(t, getBoolConfig(config, "string", false))
	assert.True(t, getBoolConfig(config, "missing", true))
}

func TestSanitizeHeader_RealWorldCases(t *testing.T) {
	cases := []struct {
		name  string
		input string
	}{
		{"simple email", "user@example.com"},
		{"email with plus", "user+tag@example.com"},
		{"email with dot", "first.last@example.com"},
		{"CR injection", "admin@example.com\r\nBCC: attacker@evil.com"},
		{"LF injection", "admin@example.com\nBCC: attacker@evil.com"},
		{"CRLF injection", "admin@example.com\r\nBCC: attacker@evil.com"},
		{"subject injection", "Normal Subject\r\nX-Header: injected"},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			result := sanitizeHeader(tc.input)
			assert.NotContains(t, result, "\r")
			assert.NotContains(t, result, "\n")
		})
	}
}

func TestSanitizeHeader_PreservesNormalHeaders(t *testing.T) {
	inputs := []string{
		"From: admin@example.com",
		"To: user@example.com",
		"Subject: Alert Notification",
	}

	for _, input := range inputs {
		t.Run(input, func(t *testing.T) {
			result := sanitizeHeader(input)
			assert.Equal(t, strings.ReplaceAll(input, "\r", ""), result)
			assert.Equal(t, strings.ReplaceAll(input, "\n", ""), result)
		})
	}
}
