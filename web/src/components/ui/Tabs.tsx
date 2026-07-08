import { useState, useRef, useEffect } from "react";
import { LucideIcon } from "lucide-react";
import Badge from "./Badge";

interface TabConfig {
  id: string;
  label: string;
  icon?: LucideIcon;
  badge?: number;
}

interface TabsProps {
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tabId: any) => void;
  variant?: "pill" | "underline";
}

export default function Tabs({
  tabs,
  activeTab,
  onTabChange,
  variant = "pill",
}: TabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
    opacity: number;
  }>({ left: 0, width: 0, opacity: 0 });

  // Calculate indicator position
  useEffect(() => {
    if (!tabsRef.current) return;
    
    const activeIndex = tabs.findIndex((t) => t.id === activeTab);
    if (activeIndex === -1) return;

    const container = tabsRef.current;
    const buttons = container.querySelectorAll("[data-tab]");
    const activeButton = buttons[activeIndex] as HTMLElement;
    
    if (activeButton && container) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      
      setIndicatorStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
        opacity: 1,
      });
    }
  }, [activeTab, tabs]);

  // Underline variant
  if (variant === "underline") {
    return (
      <div ref={tabsRef} className="relative flex items-center gap-1 border-b border-dark-border mb-4">
        {/* Animated indicator line */}
        <div
          className="absolute bottom-0 h-0.5 bg-primary-500 rounded-full transition-all duration-300 ease-in-out"
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
            opacity: indicatorStyle.opacity,
          }}
        />
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              data-tab={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-t-xl transition-all duration-200 ${
                isActive
                  ? "bg-primary-500/20 text-primary-400"
                  : "text-dark-muted hover:text-dark-text hover:bg-dark-bg/50"
              }`}
            >
              {Icon && <Icon className="icon-base" />}
              <span className="text-display-sm font-medium">{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <Badge variant="danger" size="sm">
                  {tab.badge}
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Pill variant
  return (
    <div ref={tabsRef} className="relative flex items-center gap-1 mb-4 bg-dark-bg p-1 rounded-lg w-fit">
      {/* Animated sliding background */}
      <div
        className="absolute top-1 bottom-1 bg-primary-600 rounded-lg shadow-lg shadow-primary-500/30 transition-all duration-300 ease-in-out z-0"
        style={{
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`,
          opacity: indicatorStyle.opacity,
        }}
      />
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            data-tab={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
              isActive
                ? "text-white"
                : "text-dark-muted hover:text-dark-text"
            }`}
          >
            {Icon && <Icon className="icon-base" />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="absolute -top-1 -right-1 icon-md bg-red-500 rounded-full text-display-xs flex items-center justify-center text-white">
                {Math.min(tab.badge, 99)}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
