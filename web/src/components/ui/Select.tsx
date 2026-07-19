import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
}

export default function Select({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  className = "",
  id,
  "aria-label": ariaLabel,
}: SelectProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption?.label || placeholder || "";

  const updateDropdownPosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom + 4,
      left: isRTL ? rect.right : rect.left,
      width: rect.width,
    });
  }, [isRTL]);

  const focusOption = useCallback((index: number) => {
    const dropdown = dropdownRef.current;
    if (!dropdown) return;
    const optionEls =
      dropdown.querySelectorAll<HTMLButtonElement>('[role="option"]');
    const el = optionEls[index];
    if (el) {
      el.focus();
      el.scrollIntoView({ block: "nearest" });
    }
  }, []);

  const open = () => {
    const initial = Math.max(
      0,
      options.findIndex((o) => o.value === value),
    );
    setActiveIndex(initial);
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) return;
    updateDropdownPosition();

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !buttonRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    const handleScroll = () => updateDropdownPosition();
    const handleResize = () => updateDropdownPosition();

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    const focusTimer = window.setTimeout(() => focusOption(activeIndex), 0);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, activeIndex, options, updateDropdownPosition, focusOption]);

  const selectIndex = (index: number) => {
    const option = options[index];
    if (option && !option.disabled) {
      onChange(option.value);
      setIsOpen(false);
      buttonRef.current?.focus();
    }
  };

  const handleButtonKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (!isOpen) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        open();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => {
          const next = (i + 1) % options.length;
          focusOption(next);
          return next;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => {
          const next = (i - 1 + options.length) % options.length;
          focusOption(next);
          return next;
        });
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        focusOption(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(options.length - 1);
        focusOption(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (activeIndex >= 0) selectIndex(activeIndex);
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
      case "Tab":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className="relative w-full">
      <button
        ref={buttonRef}
        type="button"
        id={id}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => (isOpen ? setIsOpen(false) : open())}
        onKeyDown={handleButtonKeyDown}
        className={`input flex items-center justify-between gap-2 ${
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        } ${className}`}
      >
        <span className="truncate">{displayValue}</span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          } ${isRTL ? "rtl-flip" : ""}`}
        />
      </button>

      {isOpen &&
        !disabled &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[99999] max-h-60 overflow-auto rounded-xl border border-border-default/70 bg-surface-secondary/95 shadow-xl shadow-black/30 backdrop-blur-sm scrollbar-thin"
            style={{
              top: `${dropdownPosition.top}px`,
              left: isRTL ? "auto" : `${dropdownPosition.left}px`,
              right: isRTL
                ? `${window.innerWidth - dropdownPosition.left}px`
                : "auto",
              width: `${dropdownPosition.width}px`,
            }}
            role="listbox"
          >
            {options.map((option, index) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={value === option.value}
                disabled={option.disabled}
                tabIndex={index === activeIndex ? 0 : -1}
                onClick={() => !option.disabled && selectIndex(index)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`w-full px-4 py-2.5 text-start text-display-sm transition-colors ${
                  option.disabled
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer hover:bg-surface-primary/60"
                } ${
                  value === option.value
                    ? "bg-primary-500/20 font-medium text-primary-300"
                    : "text-content-primary"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
