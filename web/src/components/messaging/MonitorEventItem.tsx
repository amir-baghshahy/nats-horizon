import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { formatBytes, formatTimestamp, formatJSON, detectMessageFormat } from "../../utils/formatters";
import type { MonitorEvent } from "./TrafficMonitorPanel";

interface MonitorEventItemProps {
  event: MonitorEvent;
  index: number;
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 min-w-0">
      <span className="shrink-0 text-content-tertiary">{label}</span>
      <span className="min-w-0 break-all font-mono text-content-primary">{children}</span>
    </div>
  );
}

export default function MonitorEventItem({ event, index }: MonitorEventItemProps) {
  const { t } = useTranslation();
  const [flash, setFlash] = useState(false);
  const prevTimestamp = useRef<number | string | undefined>(event.timestamp);

  useEffect(() => {
    if (prevTimestamp.current !== event.timestamp) {
      setFlash(true);
      const timer = setTimeout(() => setFlash(false), 1200);
      prevTimestamp.current = event.timestamp;
      return () => clearTimeout(timer);
    }
  }, [event.timestamp]);

  const flashClass = flash ? "animate-event-flash" : "";

  if (event.type === "stats" && event.stats) {
    return (
      <div key={`stats-${index}`} className={`p-3 ${flashClass}`}>
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-display-xs font-medium text-blue-300">
            {event.type || t('messages.event')}
          </span>
          <span className="text-display-xs text-content-tertiary">
            {formatTimestamp(Number(event.timestamp))}
          </span>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {event.stats.map((stat) => (
            <div key={stat.subject} className="rounded-lg bg-surface-primary p-2 text-display-sm">
              <p className="truncate font-mono text-primary-300">{stat.subject}</p>
              <p className="mt-0.5 text-content-tertiary">
                {stat.count.toLocaleString()} {t('messages.messagesAnd')} {formatBytes(stat.bytes)}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const isJson = event.data ? detectMessageFormat(event.data) === "json" : false;
  const prettyData = isJson ? formatJSON(event.data!) : event.data;

  return (
    <div key={`${event.type}-${event.subject}-${event.timestamp}-${index}`} className={`p-3 ${flashClass}`}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-primary-500/15 px-2 py-0.5 text-display-xs font-medium text-primary-300">
          {event.type || t('messages.event')}
        </span>
        {event.subject && (
          <span className="truncate font-mono text-display-sm text-primary-300">
            {event.subject}
          </span>
        )}
        <span className="ml-auto flex items-center gap-1 text-display-xs text-content-tertiary">
          <Clock className="h-3 w-3" />
          {formatTimestamp(Number(event.timestamp))}
        </span>
      </div>

      <div className="space-y-1.5 text-display-sm">
        {event.reply && (
          <MetaRow label={t('messages.replyLabel')}>
            {event.reply}
          </MetaRow>
        )}
        {event.size !== undefined && (
          <MetaRow label={t('messages.sizeLabel')}>
            {formatBytes(event.size)}
          </MetaRow>
        )}
      </div>

      {event.data && (
        <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-surface-primary p-2.5 text-display-xs leading-relaxed">
          <code className={isJson ? "text-green-400" : "text-blue-400"}>
            {prettyData}
          </code>
        </pre>
      )}
    </div>
  );
}
