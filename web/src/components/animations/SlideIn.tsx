import { ReactNode } from "react";

interface SlideInProps {
  children: ReactNode;
  delay?: number;
  direction?: "left" | "right" | "up" | "down";
  duration?: "150" | "200" | "300" | "500";
  className?: string;
}

export default function SlideIn({
  children,
  delay,
  direction = "up",
  duration = "300",
  className = "",
}: SlideInProps) {
  const delayClass = delay ? `animate-delay-${delay}` : "";
  const durationClass = `animate-duration-${duration}`;

  const animationMap = {
    left: "animate-slide-left",
    right: "animate-slide-right",
    up: "animate-slide-up",
    down: "animate-slide-down",
  };

  return (
    <div
      className={`${animationMap[direction]} ${delayClass} ${durationClass} ${className}`}
    >
      {children}
    </div>
  );
}
