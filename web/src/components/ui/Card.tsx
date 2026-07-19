import { HTMLAttributes, forwardRef } from "react";
import { cn } from "../../utils/cn";

type CardVariant = "default" | "stat" | "panel" | "inline";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  noPadding?: boolean;
}

const baseStyles = "relative overflow-hidden backdrop-blur-xl";

const variantStyles: Record<CardVariant, string> = {
  default:
    "rounded-xl border border-border-default/60 bg-surface-secondary/75 p-3 shadow-lg shadow-black/10",
  stat: "rounded-lg border border-border-default/70 bg-surface-primary/45 px-3 py-2 shadow-sm",
  panel:
    "rounded-2xl border border-border-subtle bg-surface-elevated/80 p-6 shadow-xl shadow-black/20",
  inline:
    "rounded-lg border border-border-default/60 bg-surface-primary/50 px-3 py-2 shadow-md",
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { className, variant = "default", noPadding = false, children, ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          noPadding && "[&>div]:p-0",
          className,
        )}
        {...props}
      >
        {/* Gradient overlay for depth */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.035] to-transparent opacity-80" />
        <div className="relative">{children}</div>
      </div>
    );
  },
);

Card.displayName = "Card";

export default Card;
