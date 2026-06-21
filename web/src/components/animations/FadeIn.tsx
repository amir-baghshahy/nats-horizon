import { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: "150" | "200" | "300" | "500";
  direction?: "up" | "down" | "none";
  className?: string;
}

export default function FadeIn({
  children,
  delay,
  duration = "300",
  direction = "up",
  className = "",
}: FadeInProps) {
  const delayClass = delay ? `animate-delay-${delay}` : "";
  const durationClass = `animate-duration-${duration}`;

  const animationClass =
    direction === "none"
      ? "animate-fade-in"
      : direction === "down"
        ? "animate-fade-in-down"
        : "animate-fade-in-up";

  return (
    <div
      className={`${animationClass} ${delayClass} ${durationClass} ${className}`}
    >
      {children}
    </div>
  );
}
