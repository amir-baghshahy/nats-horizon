import { ReactNode, Children, cloneElement, isValidElement } from "react";

interface StaggerChildrenProps {
  children: ReactNode;
  delay?: number; // Base delay in ms
  increment?: number; // Delay increment per child in ms
  className?: string;
}

const DELAY_CLASSES: Record<number, string> = {
  100: "animate-delay-100",
  200: "animate-delay-200",
  300: "animate-delay-300",
  400: "animate-delay-400",
  500: "animate-delay-500",
};

export default function StaggerChildren({
  children,
  delay = 100,
  increment = 100,
  className = "",
}: StaggerChildrenProps) {
  const childrenArray = Children.toArray(children);

  const enhancedChildren = childrenArray.map((child, index) => {
    if (!isValidElement(child)) return child;

    const childDelay = delay + index * increment;
    const delayClass =
      DELAY_CLASSES[childDelay as keyof typeof DELAY_CLASSES] || "";

    return cloneElement(child as React.ReactElement<any>, {
      className: `${delayClass} animate-fade-in-up ${child.props?.className || ""} ${className}`,
    });
  });

  return <>{enhancedChildren}</>;
}
