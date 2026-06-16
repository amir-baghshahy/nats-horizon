/**
 * Consumer configuration
 */
export interface ConsumerConfig {
  durable_name: string;
  deliver_policy: "all" | "last" | "new";
  ack_policy: "none" | "explicit" | "all";
  ack_wait: number;
  max_deliver: number;
  filter_subject: string;
  replay_policy: "instant" | "original";
}

/**
 * Consumer state/metrics
 */
export interface ConsumerState {
  num_pending: number;
  num_waiting: number;
  num_ack_pending: number;
  num_redelivered: number;
  num_deleted: number;
  last_error: string;
}

/**
 * Consumer delivery info
 */
export interface ConsumerDeliveryInfo {
  stream_seq: number;
  delivery_sequence: number;
  ack_pending: boolean;
}

/**
 * Complete Consumer information
 */
export interface Consumer {
  name: string;
  stream: string;
  config: ConsumerConfig;
  state: ConsumerState;
  delivered: ConsumerDeliveryInfo[];
  status: "active" | "idle" | "stuck";
}

/**
 * Consumer health status
 */
export type ConsumerStatus = "active" | "idle" | "stuck";

/**
 * Consumer filter options
 */
export interface ConsumerFilters {
  search: string;
  stream: string;
  status: ConsumerStatus | "all";
}

/**
 * Consumer statistics
 */
export interface ConsumerStats {
  total: number;
  active: number;
  idle: number;
  stuck: number;
  totalLag: number;
}
