import { STATUS_TONES } from "../../utils/constants";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md";
  className?: string;
}

const toneVariant: Record<Exclude<BadgeProps["variant"], "default" | undefined>, string> = {
  success: `${STATUS_TONES.success.text} ${STATUS_TONES.success.bg}`,
  warning: `${STATUS_TONES.warning.text} ${STATUS_TONES.warning.bg}`,
  danger: `${STATUS_TONES.error.text} ${STATUS_TONES.error.bg}`,
  info: `${STATUS_TONES.info.text} ${STATUS_TONES.info.bg}`,
};

const variantStyles = {
  default: "bg-border-default/50 text-content-primary",
  success: toneVariant.success,
  warning: toneVariant.warning,
  danger: toneVariant.danger,
  info: toneVariant.info,
};

const sizeStyles = {
  sm: "px-1.5 py-0.5 text-display-xs",
  md: "px-2 py-1 text-display-xs",
};

export default function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}
