import { useTranslation } from "react-i18next";

interface MessagesTabsProps {
  activeTab: "stream" | "core";
  onTabChange: (tab: "stream" | "core") => void;
}

export default function MessagesTabs({ activeTab, onTabChange }: MessagesTabsProps) {
  const { t } = useTranslation();
  return (
    <div className="mb-4 border-b border-dark-border pb-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onTabChange("stream")}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "stream"
              ? "bg-primary-500/20 text-primary-400"
              : "text-dark-muted hover:bg-dark-bg hover:text-dark-text"
          }`}
        >
          {t('messages.streamMessages')}
        </button>
        <button
          type="button"
          onClick={() => onTabChange("core")}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "core"
              ? "bg-primary-500/20 text-primary-400"
              : "text-dark-muted hover:bg-dark-bg hover:text-dark-text"
          }`}
        >
          {t('messages.coreMessaging')}
        </button>
      </div>
    </div>
  );
}
