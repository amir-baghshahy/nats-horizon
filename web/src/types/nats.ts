// Message Types
export interface Message {
  subject: string;
  data: string;
  data_base64: string;
  reply?: string;
  headers?: Record<string, string[]>;
  timestamp: number;
  size: number;
}

export interface MessageFormat {
  type: "json" | "text" | "binary" | "hex";
  view: "pretty" | "raw" | "hex";
}

// Connection & Status
export interface ConnectionStatus {
  server: string;
  ip: string;
  status: "connected" | "disconnected";
  latency: string;
}

export interface ServerInfo {
  server_name: string;
  version: string;
  host: string;
  port: number;
  auth_required: boolean;
  tls_required: boolean;
  max_payload: number;
}

// Stream & Consumer
export interface StreamInfo {
  name: string;
  config: {
    subjects: string[];
    retention: string;
    max_age: number;
    max_bytes: number;
  };
  state: {
    messages: number;
    bytes: number;
    consumers: number;
  };
}

export interface ConsumerInfo {
  name: string;
  stream: string;
  num_pending: number;
  lag: number;
  status: "active" | "idle" | "error";
}

// Dashboard Stats
export interface DashboardStats {
  streams: number;
  consumers: number;
  messages: number;
  connections: number;
  bytes: number;
  server_status: "connected" | "disconnected";
}

export interface AccountInfo {
  memory: number;
  storage: number;
  streams: number;
  consumers: number;
  api: {
    total: number;
    errors: number;
  };
}

// Forms
export interface PublishForm {
  subject: string;
  payload: string;
  replyTo: string;
  headers: string;
}

export interface RequestForm {
  subject: string;
  payload: string;
  timeout: number;
}

// Traffic Monitoring
export interface TrafficStats {
  subject: string;
  count: number;
  bytes: number;
  last_seen: number;
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SSEMessage<T = any> {
  type: "connected" | "message" | "stats" | "error";
  data: T;
  timestamp: number;
}
