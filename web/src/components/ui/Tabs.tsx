import { useState, useRef, useEffect, useCallback } from "react";
import { LucideIcon } from "lucide-react";

interface TabConfig<T extends string = string> {
  id: T;
  label: string;
  icon?: LucideIcon;
  badge?: number;
}

interface TabsProps<T extends string = string> {
  tabs: TabConfig<T>[];
  activeTab: T;
  onTabChange: (tabId: T) => void;
  variant?: "pill" | "underline";
}

export default function Tabs<T extends string = string>({
  tabs,
  activeTab,
  onTabChange,
  variant = "pill",
}: TabsProps<T>) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<{
    start: number;
    width: number;
    opacity: number;
  }>({ start: 0, width: 0, opacity: 0 });

  const updateIndicator = useCallback(() => {
    const container = tabsRef.current;
    if (!container) return;

    const activeIndex = tabs.findIndex((t) => t.id === activeTab);
    if (activeIndex === -1) return;

    const buttons = container.querySelectorAll<HTMLElement>("[data-tab]");
    const activeButton = buttons[activeIndex];
    if (!activeButton) return;

    const containerRect = container.getBoundingClientRect();
    const buttonRect = activeButton.getBoundingClientRect();
    const isRtl = getComputedStyle(container).direction === "rtl";

    const start = isRtl
      ? containerRect.right - buttonRect.right
      : buttonRect.left - containerRect.left;

    setIndicator({ start, width: buttonRect.width, opacity: 1 });
  }, [activeTab, tabs]);

  useEffect(() => {
    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [updateIndicator]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const dir = getComputedStyle(e.currentTarget).direction === "rtl";
    const forward = dir ? "ArrowLeft" : "ArrowRight";
    const backward = dir ? "ArrowRight" : "ArrowLeft";
    const current = tabs.findIndex((t) => t.id === activeTab);
    if (current === -1) return;

    let next = current;
    if (e.key === forward) next = (current + 1) % tabs.length;
    else if (e.key === backward)
      next = (current - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    else return;

    e.preventDefault();
    onTabChange(tabs[next].id);
  };

  const indicatorStyle = {
    insetInlineStart: `${indicator.start}px`,
    width: `${indicator.width}px`,
    opacity: indicator.opacity,
  };

  const baseButton = (tab: TabConfig<T>) => {
    const Icon = tab.icon;
    const isActive = activeTab === tab.id;
    return (
      <button
        key={tab.id}
        type="button"
        role="tab"
        id={`tab-${tab.id}`}
        data-tab={tab.id}
        aria-selected={isActive}
        tabIndex={isActive ? 0 : -1}
        onClick={() => onTabChange(tab.id)}
        className={`relative z-10 flex items-center gap-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
          variant === "underline"
            ? "rounded-t-xl px-4 py-3 " +
              (isActive
                ? "bg-primary-500/20 text-primary-400"
                : "text-content-tertiary hover:bg-surface-primary/50 hover:text-content-primary")
            : "rounded-lg px-4 py-2 " +
              (isActive
                ? "text-white"
                : "text-content-tertiary hover:text-content-primary")
        }`}
      >
        {Icon && <Icon className="icon-base" />}
        <span>{tab.label}</span>
        {tab.badge !== undefined && tab.badge > 0 && (
          <span className="ms-1 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1.5 text-display-xs font-semibold text-white">
            {Math.min(tab.badge, 99)}
          </span>
        )}
      </button>
    );
  };

  if (variant === "underline") {
    return (
      <div
        ref={tabsRef}
        role="tablist"
        aria-orientation="horizontal"
        onKeyDown={handleKeyDown}
        className="relative mb-4 flex items-center gap-1 border-b border-border-default"
      >
        <span
          aria-hidden="true"
          className="absolute bottom-0 h-0.5 rounded-full bg-primary-500 transition-all duration-300 ease-in-out"
          style={indicatorStyle}
        />
        {tabs.map(baseButton)}
      </div>
    );
  }

  return (
    <div
      ref={tabsRef}
      role="tablist"
      aria-orientation="horizontal"
      onKeyDown={handleKeyDown}
      className="relative mb-4 flex w-fit items-center gap-1 rounded-lg bg-surface-primary p-1"
    >
      <span
        aria-hidden="true"
        className="absolute bottom-1 top-1 rounded-lg bg-primary-600 shadow-lg shadow-primary-500/30 transition-all duration-300 ease-in-out"
        style={indicatorStyle}
      />
      {tabs.map(baseButton)}
    </div>
  );
}
