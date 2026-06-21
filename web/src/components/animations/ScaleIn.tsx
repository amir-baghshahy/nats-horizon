import { ReactNode } from "react";

interface ScaleInProps {
  children: ReactNode;
  delay?: number;
  duration?: "150" | "200" | "300" | "500";
  className?: string;
}

export default function ScaleIn({
  children,
  delay,
  duration = "300",
  className = "",
}: ScaleInProps) {
  const delayClass = delay ? `animate-delay-${delay}` : "";
  const durationClass = `animate-duration-${duration}`;

  return (
    <div
      className={`animate-scale-in ${delayClass} ${durationClass} ${className}`}
    >
      {children}
    </div>
  );
}
