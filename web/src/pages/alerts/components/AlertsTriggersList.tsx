import { Eye, Clock, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { AlertTrigger } from "../../../types";
import { PanelCard, EmptyState, Button } from "../../../components/ui";
import { formatDateTime } from "../../../utils/formatters";
import { SEVERITY_COLORS } from "../../../constants/thresholds";

interface AlertsTriggersListProps {
  triggers: AlertTrigger[];
  isAckPending: boolean;
  onAcknowledge: (alertId: string) => void;
}

export default function AlertsTriggersList({
  triggers,
  isAckPending,
  onAcknowledge,
}: AlertsTriggersListProps) {
  const { t } = useTranslation();
  if (!triggers || triggers.length === 0) {
    return (
      <EmptyState
        icon={Eye}
        title={t("alerts.noTriggeredAlerts")}
        description={t("alerts.noTriggeredAlertsDescription")}
      />
    );
  }

  return (
    <PanelCard
      className="flex-1 min-h-0"
      footer={
        <span>{t("alerts.triggerCount", { count: triggers.length })}</span>
      }
    >
      <div className="space-y-4">
        {triggers.map((trigger: AlertTrigger, index: number) => (
          <div
            key={`${trigger.alert_id}-${index}`}
            className={`border-s-4 ${
              trigger.severity === "critical"
                ? "border-s-red-500"
                : trigger.severity === "warning"
                  ? "border-s-yellow-500"
                  : "border-s-blue-500"
            } ${trigger.acked ? "opacity-60" : ""}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold">{trigger.alert_name}</h3>
                  <span
                    className={`text-display-xs px-2 py-1 rounded border ${
                      SEVERITY_COLORS[trigger.severity || "info"]
                    }`}
                  >
                    {trigger.severity}
                  </span>
                  {trigger.acked && (
                    <span className="text-display-xs flex items-center gap-1 text-green-400">
                      <CheckCircle className="w-3 h-3" />
                      {t("alerts.acknowledged")}
                    </span>
                  )}
                </div>
                <p className="text-display-sm mb-2">{trigger.message}</p>
                <div className="flex items-center gap-4 text-display-xs text-content-tertiary">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDateTime(trigger.triggered_at)}
                  </span>
                  {trigger.acked_by && (
                    <span>
                      {t("alerts.ackedBy", { name: trigger.acked_by })}
                    </span>
                  )}
                </div>
              </div>
              {!trigger.acked && (
                <Button
                  variant="secondary"
                  onClick={() =>
                    trigger.alert_id && onAcknowledge(trigger.alert_id)
                  }
                  disabled={isAckPending}
                >
                  {t("alerts.acknowledge")}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </PanelCard>
  );
}
