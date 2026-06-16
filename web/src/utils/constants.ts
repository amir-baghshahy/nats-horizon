// Status Types
export const STATUS_TYPES = {
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
  UNKNOWN: "unknown",
} as const;

export type StatusType = (typeof STATUS_TYPES)[keyof typeof STATUS_TYPES];

// Status Colors Mapping
export const STATUS_COLORS: Record<StatusType, string> = {
  success: "text-green-400 bg-green-500/20",
  warning: "text-yellow-400 bg-yellow-500/20",
  error: "text-red-400 bg-red-500/20",
  unknown: "text-gray-400 bg-gray-500/20",
};

// Message Format Colors
export const FORMAT_COLORS: Record<string, string> = {
  json: "bg-blue-500/20 text-blue-400",
  binary: "bg-orange-500/20 text-orange-400",
  text: "bg-green-500/20 text-green-400",
  hex: "bg-purple-500/20 text-purple-400",
};

// API Endpoints
export const API_ENDPOINTS = {
  // Dashboard
  DASHBOARD_STATS: "/api/dashboard/stats",
  ACCOUNT_INFO: "/api/account/info",

  // Core Messaging
  CORE_PUBLISH: "/api/core/publish",
  CORE_REQUEST: "/api/core/request",
  CORE_SUBSCRIBE: "/api/core/subscribe",
  CORE_SERVICES: "/api/core/services",

  // JetStream
  STREAMS: "/api/streams",
  STREAM_DETAIL: (name: string) => `/api/streams/${name}`,
  CONSUMERS: "/api/consumers",
  CONSUMER_DETAIL: (name: string) => `/api/consumers/${name}`,

  // System
  HEALTH: "/api/health",
  CONNECTIONS: "/api/connections",
  CLUSTER: "/api/cluster",

  // Monitoring
  METRICS: "/api/metrics",
  ALERTS: "/api/alerts",

  // Security
  SECURITY: "/api/security",

  // Tenancy
  TENANCY: "/api/tenancy",
} as const;

// Refetch Intervals (ms)
export const REFRESH_INTERVALS = {
  FAST: 5000, // 5s - for real-time data
  NORMAL: 10000, // 10s - for regular updates
  SLOW: 30000, // 30s - for slow-changing data
  NONE: 0, // disable auto-refresh
} as const;

// Payload Limits
export const LIMITS = {
  MAX_PAYLOAD_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_MESSAGES_IN_LIST: 1000,
  MAX_DISPLAYED_MESSAGES: 50,
  MAX_CONSUMER_LAG_WARNING: 1000,
  MAX_CONSUMER_LAG_CRITICAL: 10000,
} as const;

// Connection Status
export const CONNECTION_STATUS = {
  CONNECTED: "connected",
  DISCONNECTED: "disconnected",
  CONNECTING: "connecting",
} as const;

export type ConnectionStatusType =
  (typeof CONNECTION_STATUS)[keyof typeof CONNECTION_STATUS];
