import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const prevLocationRef = useRef(location);

  useEffect(() => {
    // Location changed - start transition
    if (prevLocationRef.current !== location) {
      // Fade out current content
      setIsVisible(false);

      // Wait for fade out animation, then switch content and fade in
      const timeout = setTimeout(() => {
        setDisplayChildren(children);
        prevLocationRef.current = location;

        // Small delay to ensure DOM update before fade in
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      }, 150); // Match fade-out duration

      return () => clearTimeout(timeout);
    }
  }, [location, children]);

  // Initial render
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div
      className={`transition-all duration-300 ease-in-out ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4"
      }`}
    >
      {displayChildren}
    </div>
  );
}
