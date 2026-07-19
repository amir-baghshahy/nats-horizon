import { useTranslation } from "react-i18next";
import { Activity, MessageSquare, Server } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type MessagingTab = "messages" | "request" | "monitor" | "services";

interface MessagingTabsProps {
  activeTab: MessagingTab;
  messagesCount: number;
  onTabChange: (tab: MessagingTab) => void;
}

export default function MessagingTabs({
  activeTab,
  messagesCount,
  onTabChange,
}: MessagingTabsProps) {
  const { t } = useTranslation();

  const tabs: { id: MessagingTab; label: string; icon: LucideIcon }[] = [
    {
      id: "messages",
      label: t("messages.messagesCount", { count: messagesCount }),
      icon: MessageSquare,
    },
    { id: "request", label: t("messages.requestReply"), icon: MessageSquare },
    { id: "monitor", label: t("messages.trafficMonitor"), icon: Activity },
    { id: "services", label: t("messages.services"), icon: Server },
  ];

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className="flex flex-wrap items-center gap-1 rounded-lg bg-surface-primary/60 p-1"
    >
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(id)}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-display-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
              isActive
                ? "bg-primary-600 text-white shadow-sm"
                : "text-content-tertiary hover:bg-surface-primary hover:text-content-primary"
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
