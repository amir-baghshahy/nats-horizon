import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  /**
   * Icon to display
   */
  icon?: LucideIcon;

  /**
   * Main heading
   */
  title: string;

  /**
   * Optional description
   */
  description?: string;

  /**
   * Optional action button
   */
  action?: {
    label: string;
    onClick: () => void;
  };

  /**
   * Size variant
   * @default "normal"
   */
  size?: "small" | "normal" | "large";

  /**
   * Custom icon class
   */
  iconClassName?: string;
}

/**
 * EmptyState displays a placeholder when there's no data
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  size = "normal",
  iconClassName,
}: EmptyStateProps) {
  const sizeClasses = {
    small: "p-8",
    normal: "p-12",
    large: "p-16",
  };

  const iconSize = {
    small: "w-10 h-10",
    normal: "w-16 h-16",
    large: "w-20 h-20",
  };

  const titleSize = {
    small: "text-base",
    normal: "text-lg",
    large: "text-xl",
  };

  return (
    <div className={`card text-center ${sizeClasses[size]}`}>
      {Icon && (
        <Icon
          className={`${iconSize[size]} ${iconClassName || "text-dark-muted"} mx-auto mb-4 opacity-50`}
        />
      )}
      <h3 className={`${titleSize[size]} font-medium mb-2`}>{title}</h3>
      {description && <p className="text-dark-muted mb-6">{description}</p>}
      {action && (
        <button onClick={action.onClick} className="btn-primary">
          {action.label}
        </button>
      )}
    </div>
  );
}
