import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../utils/designTokens";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      icon,
      iconPosition = "left",
      children,
      disabled,
      className = "",
      ...props
    },
    ref
  ) => {
    // Base button styles (from design system)
    const baseStyles = cn(
      "inline-flex items-center justify-center",
      "font-semibold",
      "shadow-sm",
      "transition-all duration-200",
      "disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none",
      "rounded-lg", // Consistent border radius
      "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-primary"
    );

    // Variant styles (from design system)
    const variantStyles = {
      primary:
        "bg-primary-600 text-white hover:bg-primary-500 shadow-sm focus:ring-primary-500",
      secondary:
        "bg-surface-secondary text-content-primary border border-border-default hover:bg-surface-tertiary focus:ring-primary-500",
      danger:
        "bg-red-600 text-white hover:bg-red-500 shadow-sm focus:ring-red-500",
      ghost:
        "bg-transparent text-content-primary hover:bg-surface-tertiary focus:ring-primary-500",
    };

    // Size styles (from design system)
    const sizeStyles = {
      sm: "px-3 py-1.5 text-display-sm gap-1.5",
      md: "px-4 py-2 text-display-sm gap-2",
      lg: "px-5 py-2.5 text-display-base gap-2",
    };

    // Icon sizes based on button size
    const iconSizes = {
      sm: "icon-sm",
      md: "icon-base",
      lg: "icon-md",
    };

    const widthStyles = fullWidth ? "w-full" : "";

    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          widthStyles,
          loading && "opacity-70",
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className={cn("animate-spin", iconSizes[size])} />
            {children}
          </>
        ) : (
          <>
            {icon && iconPosition === "left" && (
              <span className={cn("flex-shrink-0", iconSizes[size])}>{icon}</span>
            )}
            {children}
            {icon && iconPosition === "right" && (
              <span className={cn("flex-shrink-0", iconSizes[size])}>{icon}</span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
