import { STATUS_COLORS, StatusType } from "../../utils/constants";

interface StatusBadgeProps {
  /**
   * Status type
   */
  status: StatusType | "connected" | "disconnected";

  /**
   * Text to display (optional, defaults to status)
   */
  text?: string;

  /**
   * Size variant
   * @default "normal"
   */
  size?: "small" | "normal";

  /**
   * Whether to show a pulse animation
   * @default false
   */
  pulse?: boolean;

  /**
   * Whether to show as a dot only
   * @default false
   */
  dotOnly?: boolean;
}

/**
 * StatusBadge displays a status indicator with optional text
 */
export default function StatusBadge({
  status,
  text,
  size = "normal",
  pulse = false,
  dotOnly = false,
}: StatusBadgeProps) {
  // Normalize status
  const normalizedStatus: StatusType =
    status === "connected"
      ? "success"
      : status === "disconnected"
        ? "error"
        : status;

  const colors = STATUS_COLORS[normalizedStatus];
  const [textColor, bgColor] = colors.split(" ");

  const sizeClasses =
    size === "small"
      ? "text-display-xs px-2 py-0.5"
      : "text-display-sm px-3 py-1";

  if (dotOnly) {
    return (
      <div
        className={`w-2 h-2 rounded-full ${textColor} ${pulse ? "animate-pulse" : ""}`}
      />
    );
  }

  return (
    <div
      className={`flex items-center gap-2 ${sizeClasses} rounded-full ${bgColor} ${textColor}`}
    >
      {pulse && (
        <div className={`w-2 h-2 rounded-full ${textColor} animate-pulse`} />
      )}
      <span className="font-medium">{text || status}</span>
    </div>
  );
}
