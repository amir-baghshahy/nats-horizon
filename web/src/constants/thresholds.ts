/**
 * Consumer lag thresholds for status determination
 */
export const LAG_THRESHOLDS = {
  CRITICAL: 10000,
  WARNING: 1000,
} as const;

/**
 * Consumer lag color thresholds
 */
export const getLagColor = (lag: number): string => {
  if (lag > LAG_THRESHOLDS.CRITICAL) return "status-error";
  if (lag > LAG_THRESHOLDS.WARNING) return "status-warning";
  return "status-success";
};

/**
 * Stream health thresholds based on pending messages (lag)
 */
export const STREAM_HEALTH = {
  CRITICAL: 10000,
  WARNING: 1000,
  HEALTHY: 0,
} as const;

export const getStreamHealthStatus = (lag: number): "critical" | "warning" | "healthy" => {
  if (lag > STREAM_HEALTH.CRITICAL) return "critical";
  if (lag > STREAM_HEALTH.WARNING) return "warning";
  return "healthy";
};
