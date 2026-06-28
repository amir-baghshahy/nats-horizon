import { Bell, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Alert, AlertTrigger } from "../../../types";

interface AlertsStatsProps {
  alerts: Alert[];
  triggers: AlertTrigger[];
}

export default function AlertsStats({ alerts, triggers }: AlertsStatsProps) {
  const { t } = useTranslation();
  const totalAlerts = alerts?.length || 0;
  const activeAlerts = alerts?.filter((a: Alert) => a.enabled)?.length || 0;
  const unackedTriggers = triggers?.filter((t: AlertTrigger) => !t.acked) || [];
  const criticalTriggers =
    triggers?.filter(
      (t: AlertTrigger) => t.severity === "critical" && !t.acked,
    ) || [];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <div className="card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-xl font-bold">{totalAlerts}</p>
            <p className="text-xs text-dark-muted">{t("alerts.totalAlerts")}</p>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-xl font-bold">{activeAlerts}</p>
            <p className="text-xs text-dark-muted">{t("alerts.active")}</p>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <p className="text-xl font-bold">{unackedTriggers.length}</p>
            <p className="text-xs text-dark-muted">
              {t("alerts.unacknowledged")}
            </p>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-xl font-bold">{criticalTriggers.length}</p>
            <p className="text-xs text-dark-muted">{t("alerts.critical")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
