import type { ConsumerResponse } from "../../types";
import { getConsumerStatus } from "../../utils/validators";
import { useTranslation } from "react-i18next";
import { Database } from "lucide-react";

interface ConsumerHealthProps {
  consumers: ConsumerResponse[];
}

export default function ConsumerHealth({ consumers }: ConsumerHealthProps) {
  const { t } = useTranslation();

  if (!consumers || consumers.length === 0) {
    return (
      <div className="card h-full flex flex-col items-center justify-center gap-3 text-center p-6">
        <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-primary/50 text-content-tertiary">
          <Database className="h-7 w-7" />
        </div>
        <h3 className="text-display-lg font-semibold text-content-primary">
          {t("dashboard.noConsumerData")}
        </h3>
        <p className="text-display-sm text-content-secondary max-w-xs">
          {t("dashboard.noConsumerDataDescription")}
        </p>
      </div>
    );
  }

  const topLagging = [...consumers]
    .sort(
      (a, b) => (b.lag || b.num_pending || 0) - (a.lag || a.num_pending || 0),
    )
    .slice(0, 5);

  return (
    <div className="card overflow-hidden flex flex-col h-full min-h-0">
      <div className="p-3 border-b border-border-default bg-surface-primary/50 shrink-0">
        <h3 className="text-display-base font-semibold">
          {t("dashboard.consumerHealth")}
        </h3>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-3 space-y-2">
        {topLagging.map((consumer) => {
          const lag = consumer.lag || consumer.num_pending || 0;
          const status = getConsumerStatus(lag);

          const statusText =
            status === "error"
              ? t("dashboard.critical")
              : status === "warning"
                ? t("dashboard.slow")
                : t("dashboard.healthy");

          return (
            <div
              key={consumer.name}
              className="flex items-center justify-between p-2.5 bg-surface-primary rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <p className="text-display-sm font-medium truncate">
                  {consumer.name}
                </p>
                <p className="text-display-xs text-content-tertiary truncate">
                  {consumer.stream || t("dashboard.notSpecified")}
                </p>
              </div>
              <div className="text-right shrink-0 ml-2">
                <p
                  className={`text-display-sm font-semibold ${
                    status === "error"
                      ? "text-red-400"
                      : status === "warning"
                        ? "text-yellow-400"
                        : "text-green-400"
                  }`}
                >
                  {lag.toLocaleString()} lag
                </p>
                <p className="text-display-xs text-content-tertiary">
                  {statusText}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-2 border-t border-border-default bg-surface-primary/50 text-center text-display-xs text-content-tertiary shrink-0">
        <span className="truncate block">
          {t("dashboard.consumerHealthFooter", {
            shown: topLagging.length,
            total: consumers.length,
          })}
        </span>
      </div>
    </div>
  );
}
