// ============================================================================
// API Service Layer
// ============================================================================

import axios from 'axios'

/**
 * Base API configuration
 */
const API_BASE_URL = '/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * API error handling
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

/**
 * Wrap API call with error handling
 */
async function handleAPICall<T>(call: Promise<any>): Promise<T> {
  try {
    const response = await call
    return response.data as T
  } catch (error: any) {
    if (error.response) {
      throw new APIError(
        error.response.data?.error || error.message,
        error.response.status,
        error.response.data
      )
    }
    throw new APIError(error.message || 'Network error')
  }
}

// ============================================================================
// Streams API
// ============================================================================

export const streamsAPI = {
  /**
   * Get all streams
   */
  getAll: () => handleAPICall<any[]>(apiClient.get('/streams')),

  /**
   * Get stream details
   */
  getByName: (name: string) =>
    handleAPICall<any>(apiClient.get(`/streams/${encodeURIComponent(name)}`)),

  /**
   * Create a new stream
   */
  create: (data: {
    name: string
    subjects: string[]
    storage: string
    replicas: number
  }) => handleAPICall<any>(apiClient.post('/streams', data)),

  /**
   * Delete a stream
   */
  delete: (name: string) =>
    handleAPICall<void>(apiClient.delete(`/streams/${encodeURIComponent(name)}`)),

  /**
   * Purge stream messages
   */
  purge: (name: string) =>
    handleAPICall<void>(apiClient.post(`/streams/${encodeURIComponent(name)}/purge`)),
}

// ============================================================================
// Consumers API
// ============================================================================

export const consumersAPI = {
  /**
   * Get all consumers
   */
  getAll: () => handleAPICall<any[]>(apiClient.get('/consumers')),

  /**
   * Get consumer details
   */
  getByName: (name: string) =>
    handleAPICall<any>(apiClient.get(`/consumers/${encodeURIComponent(name)}`)),

  /**
   * Create a consumer
   */
  create: (streamName: string, data: any) =>
    handleAPICall<any>(
      apiClient.post(`/streams/${encodeURIComponent(streamName)}/consumers`, data)
    ),

  /**
   * Delete a consumer
   */
  delete: (name: string) =>
    handleAPICall<void>(apiClient.delete(`/consumers/${encodeURIComponent(name)}`)),

  /**
   * Set consumer state
   */
  setState: (name: string, state: any) =>
    handleAPICall<void>(
      apiClient.put(`/consumers/${encodeURIComponent(name)}/state`, { state })
    ),

  /**
   * Reset consumer lag
   */
  resetLag: (name: string) =>
    handleAPICall<void>(apiClient.post(`/consumers/${encodeURIComponent(name)}/lag/reset`)),
}

// ============================================================================
// Core Messaging API
// ============================================================================

export const coreAPI = {
  /**
   * Publish message
   */
  publish: (data: {
    subject: string
    payload: string
    headers?: Record<string, string[]>
    reply_to?: string
  }) => handleAPICall<any>(apiClient.post('/core/publish', data)),

  /**
   * Send request
   */
  request: (data: {
    subject: string
    payload: string
    timeout?: number
  }) => handleAPICall<any>(apiClient.post('/core/request', data)),

  /**
   * Get service discovery info
   */
  getServices: () => handleAPICall<any>(apiClient.get('/core/services')),
}

// ============================================================================
// System API
// ============================================================================

export const systemAPI = {
  /**
   * Get health status
   */
  getHealth: () => handleAPICall<any>(apiClient.get('/health')),

  /**
   * Get connections
   */
  getConnections: () => handleAPICall<any[]>(apiClient.get('/connections')),

  /**
   * Get cluster info
   */
  getCluster: () => handleAPICall<any>(apiClient.get('/cluster')),

  /**
   * Get metrics
   */
  getMetrics: () => handleAPICall<any>(apiClient.get('/metrics')),

  /**
   * Get account info
   */
  getAccountInfo: () => handleAPICall<any>(apiClient.get('/account/info')),
}
