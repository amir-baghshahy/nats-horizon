interface LoadingSpinnerProps {
  /**
   * Size variant
   * @default "normal"
   */
  size?: "small" | "normal" | "large";

  /**
   * Custom className
   */
  className?: string;

  /**
   * Text to display below spinner
   */
  text?: string;
}

/**
 * LoadingSpinner displays a loading indicator
 */
export default function LoadingSpinner({
  size = "normal",
  className,
  text,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: "w-4 h-4 border-2",
    normal: "w-8 h-8 border-3",
    large: "w-12 h-12 border-4",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center ${className || ""}`}
    >
      <div
        className={`${sizeClasses[size]} rounded-full border-dark-border border-t-primary-500 animate-spin`}
      />
      {text && <p className="text-sm text-dark-muted mt-3">{text}</p>}
    </div>
  );
}
