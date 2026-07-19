/**
 * Alert severity badge colors
 */
export const SEVERITY_COLORS: Record<string, string> = {
  info: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  critical: "bg-red-500/20 text-red-400 border-red-500/50",
};

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

export const getStreamHealthStatus = (
  lag: number,
): "critical" | "warning" | "healthy" => {
  if (lag > STREAM_HEALTH.CRITICAL) return "critical";
  if (lag > STREAM_HEALTH.WARNING) return "warning";
  return "healthy";
};
