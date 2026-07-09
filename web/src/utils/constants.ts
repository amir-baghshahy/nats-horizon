// Status Types
export const STATUS_TYPES = {
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
  UNKNOWN: "unknown",
} as const;

export type StatusType = (typeof STATUS_TYPES)[keyof typeof STATUS_TYPES];

// Semantic tone tokens — single source of truth for status color intent.
// Every status-colored surface (badges, toasts, indicators) should derive from these.
export const STATUS_TONES = {
  success: {
    text: "text-green-400",
    bg: "bg-green-500/20",
    solid: "bg-green-500",
    ring: "ring-green-500/25",
    dot: "bg-green-400",
  },
  warning: {
    text: "text-yellow-400",
    bg: "bg-yellow-500/20",
    solid: "bg-yellow-500",
    ring: "ring-yellow-500/25",
    dot: "bg-yellow-400",
  },
  error: {
    text: "text-red-400",
    bg: "bg-red-500/20",
    solid: "bg-red-500",
    ring: "ring-red-500/25",
    dot: "bg-red-400",
  },
  info: {
    text: "text-blue-400",
    bg: "bg-blue-500/20",
    solid: "bg-blue-500",
    ring: "ring-blue-500/25",
    dot: "bg-blue-400",
  },
  unknown: {
    text: "text-gray-400",
    bg: "bg-gray-500/20",
    solid: "bg-gray-500",
    ring: "ring-gray-500/25",
    dot: "bg-gray-400",
  },
} as const;

export type StatusTone = keyof typeof STATUS_TONES;

// Status Colors Mapping (derived from the tone tokens above)
export const STATUS_COLORS: Record<StatusType, string> = {
  success: `${STATUS_TONES.success.text} ${STATUS_TONES.success.bg}`,
  warning: `${STATUS_TONES.warning.text} ${STATUS_TONES.warning.bg}`,
  error: `${STATUS_TONES.error.text} ${STATUS_TONES.error.bg}`,
  unknown: `${STATUS_TONES.unknown.text} ${STATUS_TONES.unknown.bg}`,
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
