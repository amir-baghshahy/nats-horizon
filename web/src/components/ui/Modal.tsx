import { useEffect } from "react";

interface ModalWrapperProps {
  isOpen: boolean;
  children: React.ReactNode;
}

/**
 * ModalWrapper component that locks body scroll when modal is open
 * This prevents the background from scrolling when a modal is active
 */
export function ModalWrapper({ isOpen, children }: ModalWrapperProps) {
  useEffect(() => {
    // Find the main scrollable container in the Layout
    const scrollContainer = document.querySelector("main > div");

    if (isOpen) {
      // Lock body scroll
      document.body.style.overflow = "hidden";

      // Lock the inner scrollable container
      if (scrollContainer) {
        (scrollContainer as HTMLElement).style.overflow = "hidden";
      }

      // Return cleanup function
      return () => {
        document.body.style.overflow = "";
        if (scrollContainer) {
          (scrollContainer as HTMLElement).style.overflow = "";
        }
      };
    }
  }, [isOpen]);

  return <>{children}</>;
}
