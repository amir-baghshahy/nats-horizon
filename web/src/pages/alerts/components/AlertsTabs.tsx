import { Settings, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AlertsTabsProps {
  activeTab: "alerts" | "triggers";
  onTabChange: (tab: "alerts" | "triggers") => void;
  unackedCount: number;
}

export default function AlertsTabs({
  activeTab,
  onTabChange,
  unackedCount,
}: AlertsTabsProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-1 mb-4 bg-dark-bg p-1 rounded-lg w-fit">
      <button
        onClick={() => onTabChange("alerts")}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          activeTab === "alerts"
            ? "bg-primary-600 text-white"
            : "text-dark-muted hover:text-dark-text hover:bg-dark-border"
        }`}
      >
        <Settings className="w-4 h-4" />
        <span>{t("alerts.alertRules")}</span>
      </button>
      <button
        onClick={() => onTabChange("triggers")}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors relative ${
          activeTab === "triggers"
            ? "bg-primary-600 text-white"
            : "text-dark-muted hover:text-dark-text hover:bg-dark-border"
        }`}
      >
        <Eye className="w-4 h-4" />
        <span>{t("alerts.triggeredAlerts")}</span>
        {unackedCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
            {unackedCount}
          </span>
        )}
      </button>
    </div>
  );
}
