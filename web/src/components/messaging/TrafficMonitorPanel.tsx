import { useTranslation } from 'react-i18next';
import { Activity, Play, RefreshCw, StopCircle } from "lucide-react";
import { Button } from "../ui";
import { formatBytes } from "../../utils/formatters";
import MonitorEventItem from "./MonitorEventItem";

export interface MonitorEvent {
  type?: string;
  subject?: string;
  reply?: string;
  size?: number;
  timestamp?: number | string;
  data?: string;
  data_base64?: string;
  count?: number;
  bytes?: number;
  last_seen?: number;
  stats?: MonitorStats[];
}

interface MonitorStats {
  subject: string;
  count: number;
  bytes: number;
  last_seen?: number;
}

interface TrafficMonitorPanelProps {
  subjects: string;
  onSubjectsChange: (subjects: string) => void;
  isMonitoring: boolean;
  events: MonitorEvent[];
  onStart: () => void;
  onStop: () => void;
}

function formatTimestamp(timestamp?: number | string) {
  if (!timestamp) return "N/A";
  return new Date(Number(timestamp) * 1000).toLocaleTimeString();
}

function getSubjectStats(events: MonitorEvent[]): MonitorStats[] {
  const stats = new Map<string, MonitorStats>();

  events.forEach((event) => {
    if (event.type === "stats" && event.stats) {
      event.stats.forEach((item) => stats.set(item.subject, item));
    }

    if (event.type === "message" && event.subject) {
      const current = stats.get(event.subject) || {
        subject: event.subject,
        count: 0,
        bytes: 0,
      };
      stats.set(event.subject, {
        ...current,
        count: current.count + 1,
        bytes: current.bytes + (event.size || 0),
        last_seen: Number(event.timestamp) || current.last_seen,
      });
    }
  });

  return Array.from(stats.values()).sort((a, b) => b.count - a.count || a.subject.localeCompare(b.subject));
}

export default function TrafficMonitorPanel({
  subjects,
  onSubjectsChange,
  isMonitoring,
  events,
  onStart,
  onStop,
}: TrafficMonitorPanelProps) {
  const { t } = useTranslation();

  const subjectStats = getSubjectStats(events);
  const totalMessages = subjectStats.reduce((sum, stat) => sum + stat.count, 0);
  const totalBytes = subjectStats.reduce((sum, stat) => sum + stat.bytes, 0);

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="card p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Activity className={`h-5 w-5 text-primary-400 ${isMonitoring ? "animate-spin-slow" : ""}`} />
              <h2 className="text-display-xl font-bold">{t('messages.trafficMonitor')}</h2>
              {isMonitoring && (
                <span className="flex items-center gap-1.5 rounded-full bg-green-500/15 px-2 py-0.5 text-display-xs font-medium text-green-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-live-blink" />
                  {t('messages.live')}
                </span>
              )}
            </div>
            <p className="text-display-sm leading-6 text-content-tertiary">
              {t('messages.trafficMonitorDescription')}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={onStart} disabled={isMonitoring} icon={<Play className="h-4 w-4" />}>
              {t('messages.startMonitor')}
            </Button>
            <Button variant="secondary" onClick={onStop} disabled={!isMonitoring} icon={<StopCircle className="h-4 w-4" />}>
              {t('messages.stop')}
            </Button>
          </div>
        </div>

        <div className="mt-5">
          <label className="block text-display-sm font-medium mb-2">{t('messages.subjects')}</label>
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              type="text"
              value={subjects}
              onChange={(e) => onSubjectsChange(e.target.value)}
              placeholder={t('messages.enterSubjectPlaceholder')}
              className="input flex-1 font-mono"
              disabled={isMonitoring}
            />
            <Button variant="secondary" onClick={onStart} disabled={isMonitoring} icon={<RefreshCw className="h-4 w-4" />}>
              {t('messages.restart')}
            </Button>
          </div>
          <p className="mt-2 text-display-xs text-content-tertiary">
            {t('messages.subjectsHelp')}
          </p>
        </div>
      </div>

      <div className={`grid gap-3 md:grid-cols-4 ${isMonitoring ? "animate-border-flow rounded-xl" : ""}`}>
        <div className="card p-3">
          <p className="text-display-xs text-content-tertiary">{t('messages.status')}</p>
          <p className={`mt-1 text-display-lg font-bold ${isMonitoring ? "text-green-400 animate-live-glow" : ""}`}>
            {isMonitoring ? t('messages.live') : t('messages.idle')}
          </p>
        </div>
        <div className="card p-3">
          <p className="text-display-xs text-content-tertiary">{t('messages.subjects')}</p>
          <p className="mt-1 text-display-lg font-bold">{subjectStats.length}</p>
        </div>
        <div className="card p-3">
          <p className="text-display-xs text-content-tertiary">{t('messages.messagesLabel')}</p>
          <p className="mt-1 text-display-lg font-bold">{totalMessages.toLocaleString()}</p>
        </div>
        <div className="card p-3">
          <p className="text-display-xs text-content-tertiary">{t('messages.bytes')}</p>
          <p className="mt-1 text-display-lg font-bold">{formatBytes(totalBytes)}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 flex-1 min-h-0">
        <div className="card overflow-hidden flex flex-col h-full">
          <div className="border-b border-border-default p-3">
            <h3 className="font-semibold text-display-sm">{t('messages.subjectTraffic')}</h3>
          </div>
          {subjectStats.length > 0 ? (
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin divide-y divide-border-default">
              {subjectStats.map((stat) => (
                <div key={stat.subject} className="p-3">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <p className="font-mono text-display-sm font-medium truncate">{stat.subject}</p>
                      <p className="mt-0.5 text-display-xs text-content-tertiary">
                        {t('messages.lastSeen')} {formatTimestamp(stat.last_seen)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3 text-display-sm">
                      <span>
                        <span className="text-content-tertiary">{t('messages.messagesLabel')}:</span>{" "}
                        <span className="font-mono">{stat.count.toLocaleString()}</span>
                      </span>
                      <span>
                        <span className="text-content-tertiary">{t('messages.bytesLabel')}:</span>{" "}
                        <span className="font-mono">{formatBytes(stat.bytes)}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-content-tertiary">
              <Activity className="mx-auto mb-2 h-10 w-10 opacity-50" />
              <p className="text-display-sm">{t('messages.noTrafficCaptured')}</p>
            </div>
          )}
        </div>

        <div className="card overflow-hidden flex flex-col h-full">
          <div className="border-b border-border-default p-3">
            <h3 className="font-semibold text-display-sm">{t('messages.recentEvents')}</h3>
          </div>
          {events.length > 0 ? (
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin divide-y divide-border-default">
              {events.map((event, index) => (
                <MonitorEventItem key={`${event.type}-${event.subject}-${event.timestamp}-${index}`} event={event} index={index} />
              ))}
            </div>
          ) : (
          <div className="p-6 text-center text-content-tertiary">
            <p className="text-display-sm">{t('messages.eventsEmpty')}</p>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
