package config

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestValidateNATSURL(t *testing.T) {
	tests := []struct {
		name    string
		url     string
		wantErr bool
	}{
		{"valid nats", "nats://localhost:4222", false},
		{"valid tls", "tls://nats.example.com:4222", false},
		{"empty", "", true},
		{"invalid scheme", "http://localhost:4222", true},
		{"no host", "nats://", true},
		{"ws scheme", "ws://localhost:4222", true},
		{"wss scheme", "wss://localhost:4222", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateNATSURL(tt.url)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestAppConfig_Validate(t *testing.T) {
	tests := []struct {
		name    string
		config  *AppConfig
		wantErr bool
	}{
		{
			name: "valid default config",
			config: &AppConfig{
				ServerPort:        3000,
				ServerBindAddress: "127.0.0.1",
				GinMode:            "release",
				NATSURL:            "nats://localhost:4222",
				SMTPPort:           587,
				SMTPFrom:           "test@example.com",
			},
			wantErr: false,
		},
		{
			name: "invalid port",
			config: &AppConfig{
				ServerPort: 0,
			},
			wantErr: true,
		},
		{
			name: "invalid bind address",
			config: &AppConfig{
				ServerPort:        3000,
				ServerBindAddress: ":::invalid::",
			},
			wantErr: true,
		},
		{
			name: "valid bind address 0.0.0.0",
			config: &AppConfig{
				ServerPort:        3000,
				ServerBindAddress: "0.0.0.0",
			},
			wantErr: false,
		},
		{
			name: "invalid gin mode",
			config: &AppConfig{
				ServerPort: 3000,
				GinMode:    "invalid",
			},
			wantErr: true,
		},
		{
			name: "SMTP from required when host set",
			config: &AppConfig{
				ServerPort: 3000,
				SMTPHost:   "smtp.example.com",
				SMTPFrom:   "",
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.config.Validate()
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestIsLocalhost(t *testing.T) {
	tests := []struct {
		addr string
		want bool
	}{
		{"localhost:3000", true},
		{"127.0.0.1:3000", true},
		{"[::1]:3000", true},
		{"0.0.0.0:3000", false},
		{"192.168.1.1:3000", false},
	}

	for _, tt := range tests {
		t.Run(tt.addr, func(t *testing.T) {
			got := IsLocalhost(tt.addr)
			assert.Equal(t, tt.want, got)
		})
	}
}
