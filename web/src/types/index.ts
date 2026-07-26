// Export all from the generated API client
export * from "../generated/index";

// Add custom types that were previously defined
export type ConnectionStatus = {
  id: string;
  name: string;
  connected: boolean;
  healthy: boolean;
  latency?: string;
  error?: string;
  last_checked: string;
};

export type StreamHealthStatus = "all" | "healthy" | "warning" | "critical";

export interface StreamFilters {
  search: string;
  storage: "file" | "memory" | "all";
  status: StreamHealthStatus;
  minMessages: number;
  maxMessages: number;
  minConsumers: number;
  subjectPattern: string;
}

export interface StreamStats {
  total: number;
  fileStorage: number;
  memoryStorage: number;
  totalMessages: number;
  totalBytes: number;
  totalConsumers: number;
}
