import { Bell, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Alert, AlertTrigger } from "../../../types";
import { StatCard } from "../../../components/ui";

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
      <StatCard
        icon={Bell}
        value={totalAlerts}
        label={t("alerts.totalAlerts")}
        iconBg="bg-blue-500/20"
        iconColor="text-blue-400"
      />
      <StatCard
        icon={CheckCircle}
        value={activeAlerts}
        label={t("alerts.active")}
        iconBg="bg-green-500/20"
        iconColor="text-green-400"
      />
      <StatCard
        icon={AlertTriangle}
        value={unackedTriggers.length}
        label={t("alerts.unacknowledged")}
        iconBg="bg-yellow-500/20"
        iconColor="text-yellow-400"
      />
      <StatCard
        icon={AlertCircle}
        value={criticalTriggers.length}
        label={t("alerts.critical")}
        iconBg="bg-red-500/20"
        iconColor="text-red-400"
      />
    </div>
  );
}
