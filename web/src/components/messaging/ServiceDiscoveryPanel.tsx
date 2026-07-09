import { useTranslation } from 'react-i18next';
import { Network, RefreshCw, Server } from "lucide-react";
import { Button } from "../ui";

export interface ServiceInfo {
  server_name?: string;
  version?: string;
  max_payload?: number;
}

interface ServiceDiscoveryPanelProps {
  serviceInfo?: ServiceInfo;
  subscriptions: Set<string>;
  onRefresh?: () => void;
}

export default function ServiceDiscoveryPanel({
  serviceInfo,
  subscriptions,
  onRefresh,
}: ServiceDiscoveryPanelProps) {
  const { t } = useTranslation();

  const subscriptionList = Array.from(subscriptions);

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="flex items-center gap-2 text-display-xl font-bold">
            <Server className="h-5 w-5" />
            {t('messages.serviceDiscovery')}
          </h2>
          <Button variant="secondary" onClick={onRefresh} icon={<RefreshCw className="h-4 w-4" />}>
            {t('common.refresh')}
          </Button>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-surface-primary/50 p-4">
            <p className="text-display-xs text-content-tertiary">{t('messages.serverName')}</p>
            <p className="mt-1 truncate text-display-sm font-mono">
              {serviceInfo?.server_name || t('messages.natsServer')}
            </p>
          </div>
          <div className="rounded-xl bg-surface-primary/50 p-4">
            <p className="text-display-xs text-content-tertiary">{t('messages.version')}</p>
            <p className="mt-1 text-display-sm">
              {serviceInfo?.version || t('messages.notAvailable')}
            </p>
          </div>
          <div className="rounded-xl bg-surface-primary/50 p-4">
            <p className="text-display-xs text-content-tertiary">{t('messages.maxPayload')}</p>
            <p className="mt-1 text-display-sm">
              {serviceInfo?.max_payload
                ? `${(serviceInfo.max_payload / 1024).toFixed(0)} KB`
                : t('messages.notAvailable')}
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="mb-4 flex items-center gap-2 text-display-lg font-semibold">
          <Network className="h-5 w-5 text-primary-400" />
          {t('messages.activeSubscriptions')}
        </h3>
        {subscriptionList.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {subscriptionList.map((subject) => (
              <span
                key={subject}
                className="rounded-xl border border-border-default/70 bg-surface-primary/50 px-3 py-2 font-mono text-display-sm text-primary-300"
              >
                {subject}
              </span>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border-default bg-surface-primary/30 p-8 text-center text-content-tertiary">
            <Network className="mx-auto mb-3 h-12 w-12 opacity-50" />
            <p>{t('messages.subscribeToMonitor')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
