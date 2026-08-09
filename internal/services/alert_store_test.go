package services

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sync"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestAlertStore_ConcurrentAccess(t *testing.T) {
	dir := t.TempDir()
	store := &AlertStore{
		alerts:   make([]PersistedAlert, 0),
		filePath: filepath.Join(dir, "alerts.json"),
	}

	var wg sync.WaitGroup
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			store.SaveOrUpdate(PersistedAlert{
				ID:       string(rune('a' + id)),
				Name:     "Test Alert",
				Severity: "info",
			})
		}(i)
	}
	wg.Wait()

	alerts := store.GetAll()
	assert.Len(t, alerts, 10)
}

func TestAlertStore_AtomicWrite(t *testing.T) {
	dir := t.TempDir()
	store := &AlertStore{
		alerts:   make([]PersistedAlert, 0),
		filePath: filepath.Join(dir, "alerts.json"),
	}

	store.SaveOrUpdate(PersistedAlert{
		ID:       "alert-1",
		Name:     "Test Alert",
		Severity: "info",
	})

	// Verify file exists and is valid JSON
	data, err := os.ReadFile(store.filePath)
	require.NoError(t, err)

	var alerts []PersistedAlert
	err = json.Unmarshal(data, &alerts)
	require.NoError(t, err)
	assert.Len(t, alerts, 1)
	assert.Equal(t, "alert-1", alerts[0].ID)
}

func TestAlertStore_ConcurrentWrite(t *testing.T) {
	dir := t.TempDir()
	store := &AlertStore{
		alerts:   make([]PersistedAlert, 0),
		filePath: filepath.Join(dir, "alerts.json"),
	}

	var wg sync.WaitGroup
	for i := 0; i < 20; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			store.SaveOrUpdate(PersistedAlert{
				ID:       string(rune('a' + id%26)),
				Name:     "Concurrent Alert",
				Severity: "warning",
			})
		}(i)
	}
	wg.Wait()

	// File should still be valid JSON
	data, err := os.ReadFile(store.filePath)
	require.NoError(t, err)

	var alerts []PersistedAlert
	err = json.Unmarshal(data, &alerts)
	require.NoError(t, err)
	assert.True(t, len(alerts) > 0, "should have some alerts")
}

func TestAlertStore_GetByID(t *testing.T) {
	store := &AlertStore{
		alerts: []PersistedAlert{
			{ID: "1", Name: "Alert 1"},
			{ID: "2", Name: "Alert 2"},
		},
	}

	alert, found := store.GetByID("1")
	assert.True(t, found)
	assert.Equal(t, "Alert 1", alert.Name)

	_, found = store.GetByID("3")
	assert.False(t, found)
}

func TestAlertStore_Delete(t *testing.T) {
	dir := t.TempDir()
	store := &AlertStore{
		alerts: []PersistedAlert{
			{ID: "1", Name: "Alert 1"},
			{ID: "2", Name: "Alert 2"},
		},
		filePath: filepath.Join(dir, "alerts.json"),
	}

	err := store.Delete("1")
	require.NoError(t, err)

	alerts := store.GetAll()
	assert.Len(t, alerts, 1)
	assert.Equal(t, "2", alerts[0].ID)

	err = store.Delete("3")
	assert.Error(t, err)
}

func TestAlertStore_UpdateLastTrigger(t *testing.T) {
	dir := t.TempDir()
	store := &AlertStore{
		alerts: []PersistedAlert{
			{ID: "1", Name: "Alert 1", TriggerCount: 0},
		},
		filePath: filepath.Join(dir, "alerts.json"),
	}

	before := time.Now()
	err := store.UpdateLastTrigger("1")
	after := time.Now()
	require.NoError(t, err)

	alert, found := store.GetByID("1")
	require.True(t, found)
	assert.Equal(t, 1, alert.TriggerCount)
	assert.True(t, alert.LastTrigger.After(before) || alert.LastTrigger.Equal(before))
	assert.True(t, alert.LastTrigger.Before(after) || alert.LastTrigger.Equal(after))
}
