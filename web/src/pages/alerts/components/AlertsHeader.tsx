import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Zap } from "lucide-react";

interface AlertsHeaderProps {
  onNewAlert: () => void;
  onCheckAlerts: () => void;
  isChecking: boolean;
  rightElement?: ReactNode;
}

export default function AlertsHeader({
  onNewAlert,
  onCheckAlerts,
  isChecking,
  rightElement,
}: AlertsHeaderProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h1 className="text-xl md:text-xl font-bold">{t("alerts.title")}</h1>
        <p className="text-dark-muted mt-1">{t("alerts.subtitle")}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onNewAlert}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t("alerts.newAlert")}
        </button>
        <button
          onClick={onCheckAlerts}
          disabled={isChecking}
          className="btn-secondary flex items-center gap-2 disabled:opacity-50"
        >
          <Zap className="w-4 h-4" />
          {t("alerts.checkNow")}
        </button>
        {rightElement}
      </div>
    </div>
  );
}
