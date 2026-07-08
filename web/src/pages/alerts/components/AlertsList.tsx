import {
  Bell,
  ToggleLeft,
  ToggleRight,
  Edit,
  Trash2,
  Clock,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Alert } from "../../../types";
import { PanelCard, EmptyState } from "../../../components/ui";

interface AlertsListProps {
  alerts: Alert[];
  isTogglePending: boolean;
  onToggle: (alert: Alert) => void;
  onEdit: (alert: Alert) => void;
  onDelete: (alert: Alert) => void;
  confirm: (options: any) => Promise<boolean>;
}

const SEVERITY_COLORS: Record<string, string> = {
  info: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  critical: "bg-red-500/20 text-red-400 border-red-500/50",
};

const formatTimestamp = (timestamp: string) =>
  new Date(timestamp).toLocaleString();

const formatCooldown = (nanos: number) => {
  const seconds = nanos / 1000000000;
  if (seconds >= 60) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds)}s`;
};

export default function AlertsList({
  alerts,
  isTogglePending,
  onToggle,
  onEdit,
  onDelete,
  confirm,
}: AlertsListProps) {
  const { t } = useTranslation();
  if (alerts.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title={t("alerts.noAlertsConfigured")}
        description={t("alerts.noAlertsConfiguredDescription")}
        action={{
          label: t("alerts.createFirstAlert"),
          onClick: () => onEdit({} as Alert),
        }}
      />
    );
  }

  return (
    <PanelCard
      maxHeight={600}
      footer={<span>{t("alerts.alertCount", { count: alerts.length })}</span>}
    >
      <div className="space-y-4">
        {alerts.map((alert: Alert, index: number) => {
          const delayClass =
            index === 0 ? "" : `animate-delay-${Math.min(index * 50, 500)}`;
          return (
            <div
              key={alert.id}
              className={`card hover:border-dark-border/50 transition-colors animate-fade-in hover-lift ${delayClass}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <button
                    onClick={() => onToggle(alert)}
                    className="mt-1 hover-scale active-scale"
                    disabled={isTogglePending}
                  >
                    {alert.enabled ? (
                      <ToggleRight className="icon-md text-green-400 animate-bounce-in" />
                    ) : (
                      <ToggleLeft className="icon-md text-dark-muted" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{alert.name}</h3>
                      <span
                        className={`text-display-xs px-2 py-1 rounded border ${
                          SEVERITY_COLORS[alert.severity || "info"]
                        }`}
                      >
                        {alert.severity}
                      </span>
                      {!alert.enabled && (
                        <span className="text-display-xs text-dark-muted">
                          {t("alerts.disabled")}
                        </span>
                      )}
                    </div>
                    <p className="text-display-sm text-dark-muted mb-3">
                      {alert.description}
                    </p>
                    <div className="flex items-center gap-4 text-display-xs text-dark-muted">
                      {alert.condition && (
                        <span className="font-mono bg-dark-bg px-2 py-1 rounded">
                          {alert.condition.type}: {alert.condition.operator}{" "}
                          {alert.condition.threshold}
                        </span>
                      )}
                      {alert.condition?.stream && (
                        <span>
                          {t("alerts.stream", { name: alert.condition.stream })}
                        </span>
                      )}
                      <span>
                        {t("alerts.cooldown", {
                          duration: formatCooldown(alert.cooldown || 0),
                        })}
                      </span>
                      <span>
                        {t("alerts.triggered", {
                          count: alert.trigger_count || 0,
                        })}
                      </span>
                      {alert.last_trigger && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(alert.last_trigger)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(alert)}
                    className="p-2 hover:bg-dark-bg rounded-lg hover-lift active-scale"
                    title={t("alerts.edit")}
                  >
                    <Edit className="icon-base" />
                  </button>
                  <button
                    onClick={async () => {
                      const ok = await confirm({
                        title: t("alerts.deleteAlert"),
                        message: t("alerts.deleteAlertConfirm", {
                          name: alert.name,
                        }),
                        confirmLabel: t("alerts.delete"),
                        variant: "danger",
                      });
                      if (ok) onDelete(alert);
                    }}
                    className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg hover-lift active-scale"
                    title={t("alerts.delete")}
                  >
                    <Trash2 className="icon-base" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </PanelCard>
  );
}
