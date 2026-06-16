/**
 * Stream configuration
 */
export interface StreamConfig {
  name: string;
  subjects: string[];
  storage: "file" | "memory";
  max_age: number;
  max_bytes: number;
  max_msg_size: number;
  replicas: number;
  retention: "limits" | "interest" | "workqueue";
  discard: "old" | "new";
  Ack_window: boolean;
}

/**
 * Stream state/metrics
 */
export interface StreamState {
  messages: number;
  bytes: number;
  consumers: number;
  num_deleted: number;
  num_pending: number;
  last_error: string;
}

/**
 * Complete Stream information
 */
export interface Stream {
  config: StreamConfig;
  state: StreamState;
  name: string;
}

/**
 * Stream health status
 */
export type StreamHealthStatus = "healthy" | "warning" | "critical";

/**
 * Stream storage type
 */
export type StreamStorageType = "file" | "memory";

/**
 * Stream filter options
 */
export interface StreamFilters {
  search: string;
  storage: StreamStorageType | "all";
  status: StreamHealthStatus | "all";
  minMessages: number;
  maxMessages: number;
  minConsumers: number;
  subjectPattern: string;
}

/**
 * Stream statistics
 */
export interface StreamStats {
  total: number;
  fileStorage: number;
  memoryStorage: number;
  totalMessages: number;
  totalBytes: number;
  totalConsumers: number;
}

/**
 * Stream creation form
 */
export interface CreateStreamForm {
  name: string;
  subjects: string; // Comma-separated
  storage: StreamStorageType;
  replicas: number;
}
