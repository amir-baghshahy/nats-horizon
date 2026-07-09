import { useEffect, useRef } from "react";

interface ModalWrapperProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Modal shell that handles global modal behavior for every dialog in the app:
 * - Locks page scroll while open
 * - Closes on Escape
 * - Traps focus within the dialog (keyboard accessibility)
 * - Restores focus to the trigger on close
 *
 * The visual dialog (backdrop, panel, header) is provided by the consumer so
 * existing modal markup is preserved; this component only manages behavior.
 */
export function ModalWrapper({ isOpen, onClose, children }: ModalWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const container = containerRef.current;
    if (!container) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const scrollContainer = document.querySelector("main > div") as HTMLElement | null;
    const previousBodyOverflow = document.body.style.overflow;
    const previousScrollOverflow = scrollContainer?.style.overflow;
    document.body.style.overflow = "hidden";
    if (scrollContainer) scrollContainer.style.overflow = "hidden";

    const getFocusable = () =>
      Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);

    const dialog = container.querySelector<HTMLElement>('[role="dialog"]');
    const focusTimer = window.setTimeout(() => {
      const focusable = getFocusable();
      (focusable[0] ?? dialog ?? container).focus();
    }, 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose?.();
        return;
      }
      if (e.key !== "Tab" || !dialog) return;

      const focusable = getFocusable();
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && (active === first || active === dialog)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      if (scrollContainer) scrollContainer.style.overflow = previousScrollOverflow ?? "";
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen, onClose]);

  return (
    <div ref={containerRef} className="contents">
      {children}
    </div>
  );
}

export default ModalWrapper;
