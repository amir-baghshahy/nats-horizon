import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  type?: "fade" | "slideUp" | "scale" | "slideLeft" | "bounce";
  className?: string;
}

const ANIMATION_CLASSES = {
  fade: "animate-fade-in",
  slideUp: "animate-slide-up",
  scale: "animate-scale-in",
  slideLeft: "animate-slide-left",
  bounce: "animate-bounce-in",
};

export default function PageTransition({
  children,
  type = "fade",
  className = "",
}: PageTransitionProps) {
  return (
    <div className={`${ANIMATION_CLASSES[type]} ${className}`}>{children}</div>
  );
}
