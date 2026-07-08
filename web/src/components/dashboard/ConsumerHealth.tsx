import type { ConsumerResponse } from "../../types";
import { getConsumerStatus } from "../../utils/validators";
import { useTranslation } from "react-i18next";

interface ConsumerHealthProps {
  consumers: ConsumerResponse[];
}

export default function ConsumerHealth({ consumers }: ConsumerHealthProps) {
  const { t } = useTranslation();

  if (!consumers || consumers.length === 0) {
    return null;
  }

  const topLagging = [...consumers]
    .sort(
      (a, b) => (b.lag || b.num_pending || 0) - (a.lag || a.num_pending || 0),
    )
    .slice(0, 5);

  return (
    <div className="card overflow-hidden flex flex-col max-h-[350px]">
      <div className="p-3 border-b border-dark-border bg-dark-bg/50 flex-shrink-0">
        <h3 className="text-display-base font-semibold">{t('dashboard.consumerHealth')}</h3>
      </div>

      <div className="overflow-y-auto scrollbar-thin flex-1 p-3 space-y-2">
        {topLagging.map((consumer) => {
          const lag = consumer.lag || consumer.num_pending || 0;
          const status = getConsumerStatus(lag);

          const statusText =
            status === "error"
              ? t('dashboard.critical')
              : status === "warning"
                ? t('dashboard.slow')
                : t('dashboard.healthy');

          return (
            <div
              key={consumer.name}
              className="flex items-center justify-between p-2.5 bg-dark-bg rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <p className="text-display-sm font-medium truncate">{consumer.name}</p>
                <p className="text-display-xs text-dark-muted truncate">
                  {consumer.stream || t('dashboard.notSpecified')}
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
                <p className="text-display-xs text-dark-muted">{statusText}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-2 border-t border-dark-border bg-dark-bg/50 text-center text-display-xs text-dark-muted flex-shrink-0">
        {t('dashboard.consumerCount', { count: topLagging.length })}
      </div>
    </div>
  );
}
