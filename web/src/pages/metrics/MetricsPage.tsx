import { UseMetricsReturn } from "./hooks/useMetrics";
import type { MetricSeries, MetricsResponse } from "../../types";
import { useTranslation } from "react-i18next";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Clock,
  Database,
  HardDrive,
  MessageSquare,
  Minus,
  RefreshCw,
  TrendingUp,
  Zap,
} from "lucide-react";

import { formatBytes, formatNumber } from "../../utils/formatters";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageError, PageLoading } from "../../components/ui/PageState";
import Select from "../../components/ui/Select";
import { PageHeader, PanelCard, EmptyState } from "../../components/ui";
import { Button } from "../../components/ui";
import Badge from "../../components/ui/Badge";

const durations = [
  { label: "last15Minutes", value: "15m" },
  { label: "last1Hour", value: "1h" },
  { label: "last6Hours", value: "6h" },
  { label: "last24Hours", value: "24h" },
];

const TONES: Record<string, string> = {
  blue: "bg-blue-500/15 text-blue-400",
  purple: "bg-purple-500/15 text-purple-400",
  emerald: "bg-emerald-500/15 text-emerald-400",
  amber: "bg-amber-500/15 text-amber-400",
  primary: "bg-primary-500/15 text-primary-400",
};

// Sum a metric type across all streams, index-aligned, for a hero trend.
function aggregateSeries(metrics: MetricsResponse | undefined, type: string) {
  const list = (metrics?.streams || []).filter((s) => s.labels?.type === type);
  if (!list.length) return { data: [] } as MetricSeries;
  const maxLen = Math.max(...list.map((s) => s.data?.length || 0));
  const data: { value?: number; timestamp?: number }[] = [];
  for (let i = 0; i < maxLen; i++) {
    let sum = 0;
    let ts: number | undefined;
    for (const s of list) {
      const d = s.data?.[i];
      if (d) {
        sum += d.value || 0;
        ts = d.timestamp;
      }
    }
    data.push({ value: sum, timestamp: ts });
  }
  return { data } as MetricSeries;
}

function KpiCard({
  icon: Icon,
  label,
  value,
  trend,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  trend?: number;
  tone: keyof typeof TONES;
}) {
  const TrendIcon =
    trend && trend > 0 ? ArrowUpRight : trend && trend < 0 ? ArrowDownRight : Minus;
  const trendColor =
    trend && trend > 0
      ? "text-green-400"
      : trend && trend < 0
        ? "text-red-400"
        : "text-content-tertiary";
  return (
    <div className="card p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${TONES[tone]}`}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <span className="truncate text-display-xs text-content-tertiary">{label}</span>
        </div>
        {trend !== undefined && (
          <div className={`flex shrink-0 items-center gap-0.5 text-display-xs font-medium ${trendColor}`}>
            <TrendIcon className="h-3 w-3" />
            <span>{Math.abs(trend).toFixed(1)}%</span>
          </div>
        )}
      </div>
      <p className="mt-2 text-display-lg font-bold tabular-nums leading-none">{value}</p>
    </div>
  );
}

function StatCardShell({
  icon: Icon,
  label,
  tone,
  corner,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tone: keyof typeof TONES;
  corner?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-surface-primary/50 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${TONES[tone]}`}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <span className="truncate text-display-xs text-content-tertiary">{label}</span>
        </div>
        {corner && <div className="shrink-0">{corner}</div>}
      </div>
      {children}
    </div>
  );
}

function UsageBar({
  label,
  used,
  max,
  usage,
}: {
  label: string;
  used: number;
  max?: number;
  usage?: number;
}) {
  const { t } = useTranslation();
  const pct = usage ?? (max ? (used / max) * 100 : 0);
  const barColor = pct > 90 ? "bg-red-400" : pct > 70 ? "bg-yellow-400" : "bg-green-400";
  const textColor = pct > 90 ? "text-red-400" : pct > 70 ? "text-yellow-400" : "text-green-400";
  const status = pct > 90 ? t("common.critical") : pct > 70 ? t("common.warning") : t("common.healthy");
  return (
    <StatCardShell
      icon={HardDrive}
      label={label}
      tone="purple"
      corner={<span className={`text-display-xs font-medium ${textColor}`}>{status}</span>}
    >
      <p className="mt-2 text-display-base font-semibold tabular-nums leading-none">{formatBytes(used || 0)}</p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border-default">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.min(pct || 0, 100)}%` }}
        />
      </div>
      <p className="mt-1.5 text-display-xs text-content-tertiary">
        {max
          ? `${pct.toFixed(0)}% ${t("common.of")} ${formatBytes(max)}`
          : `${pct.toFixed(0)}% — ${t("common.unlimited")}`}
      </p>
    </StatCardShell>
  );
}

function StatBlock({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  sub: string;
  tone: keyof typeof TONES;
}) {
  return (
    <StatCardShell icon={Icon} label={label} tone={tone}>
      <p className="mt-2 text-display-base font-semibold tabular-nums leading-none">{value}</p>
      <p className="mt-1.5 text-display-xs text-content-tertiary">{sub}</p>
    </StatCardShell>
  );
}

function HeroChart({ series, color }: { series: MetricSeries; color: string }) {
  const { t } = useTranslation();
  const hex = `rgb(${color})`;
  const chartData = (series.data || []).map((p, i) => ({ i, v: p.value || 0, ts: p.timestamp }));

  if (chartData.length < 2) {
    return (
      <div className="flex h-32 flex-col items-center justify-center text-center">
        <div className="icon-lg mb-3 flex items-center justify-center rounded-full bg-border-default/30">
          <TrendingUp className="icon-md text-content-tertiary/50" />
        </div>
        <p className="text-display-xs text-content-tertiary/60">{t("common.collectingData")}</p>
      </div>
    );
  }

  const peak = Math.max(...chartData.map((d) => d.v));

  return (
    <div className="h-32 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id={`hero-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={hex} stopOpacity={0.35} />
              <stop offset="100%" stopColor={hex} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="i" hide />
          <YAxis hide domain={["dataMin", "dataMax"]} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as { v: number; ts?: number };
              return (
                <div className="rounded-lg border border-border-default bg-surface-secondary/95 px-3 py-2 text-display-xs shadow-xl backdrop-blur">
                  <p className="mb-0.5 text-content-tertiary">
                    {p.ts
                      ? new Date(p.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : ""}
                  </p>
                  <p className="font-mono font-semibold" style={{ color: hex }}>
                    {formatNumber(p.v)}
                  </p>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="v"
            stroke={hex}
            strokeWidth={2}
            fill={`url(#hero-${color})`}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="mt-1 text-center text-display-xs text-content-tertiary">
        {t("metrics.totalMessages")}: {formatNumber(peak)} {t("common.peak")}
      </p>
    </div>
  );
}

function TopStreamRow({ stream, max, rank }: { stream: any; max: number; rank: number }) {
  const rate = stream.messages_per_sec || 0;
  const pct = max > 0 ? (rate / max) * 100 : 0;
  return (
    <div className="group flex items-center gap-3 rounded-xl bg-surface-primary/50 p-3 transition-colors hover:bg-surface-primary">
      <span className="w-5 shrink-0 text-center text-display-sm font-semibold text-content-tertiary">
        {rank}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-mono text-display-sm group-hover:text-primary-400 transition-colors">
            {stream.name}
          </p>
          <span className="shrink-0 text-display-xs tabular-nums text-content-tertiary">
            {rate.toFixed(1)} msg/s
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border-default">
          <div
            className="h-full rounded-full bg-primary-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1 text-display-xs text-content-tertiary">
          {formatBytes(stream.bytes_per_sec || 0)}/s · {formatNumber(stream.messages || 0)} total msgs
        </p>
      </div>
    </div>
  );
}

export default function MetricsPage({
  duration,
  setDuration,
  autoRefresh,
  setAutoRefresh,
  metrics,
  rates,
  systemMetrics,
  isLoading,
  error,
  refetch,
  getErrorMessage,
  getTrend,
  streamNames,
  totalMessages,
  totalStorage,
  rateStreams,
  rateTotalMessages,
  rateTotalBytes,
}: UseMetricsReturn) {
  const { t } = useTranslation();

  if (isLoading) {
    return <PageLoading text={t("metrics.loading")} />;
  }

  if (error) {
    return <PageError message={getErrorMessage(error)} onRetry={refetch} />;
  }

  const totalMessagesSeries = aggregateSeries(metrics, "messages");
  const totalStorageSeries = aggregateSeries(metrics, "bytes");
  const messagesTrend = getTrend(totalMessagesSeries);
  const storageTrend = getTrend(totalStorageSeries);
  const durationLabel = t(`metrics.${durations.find((d) => d.value === duration)?.label ?? "last1Hour"}`);
  const topStreams = [...rateStreams]
    .sort((a: any, b: any) => (b.messages_per_sec || 0) - (a.messages_per_sec || 0))
    .slice(0, 8);
  const maxRateMessages = Math.max(...rateStreams.map((s: any) => s.messages_per_sec || 0), 0);

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 animate-fade-in md:h-full md:overflow-hidden">
      <div className="shrink-0">
      <PageHeader
        title={t("metrics.title")}
        subtitle={t("metrics.subtitle")}
        actions={
          <>
            <Select
              value={duration}
              onChange={setDuration}
              options={durations.map((item) => ({
                value: item.value,
                label: t(`metrics.${item.label}`),
              }))}
              className="w-[140px] shrink-0"
              aria-label={t("metrics.duration")}
            />
            <Button
              type="button"
              variant={autoRefresh ? "primary" : "secondary"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              aria-pressed={autoRefresh}
              icon={autoRefresh ? <Activity className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
              className={autoRefresh ? "animate-pulse-glow" : ""}
            >
              <span className="hidden sm:inline">{t("metrics.autoRefresh")}</span>
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => refetch()}
              icon={<RefreshCw className="h-3.5 w-3.5" />}
              aria-label={t("common.refresh")}
            />
          </>
        }
      />
      </div>

      {/* KPI overview */}
      <div className="shrink-0 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          icon={MessageSquare}
          value={formatNumber(totalMessages)}
          label={t("metrics.totalMessages")}
          trend={messagesTrend}
          tone="blue"
        />
        <KpiCard
          icon={HardDrive}
          value={formatBytes(totalStorage)}
          label={t("metrics.totalStorage")}
          trend={storageTrend}
          tone="purple"
        />
        <KpiCard
          icon={Database}
          value={formatNumber(streamNames.length)}
          label={t("metrics.activeStreams")}
          tone="emerald"
        />
        <KpiCard
          icon={Zap}
          value={formatNumber(rateTotalMessages)}
          label={t("metrics.messagesInRateWindow")}
          tone="amber"
        />
      </div>

      {/* Hero throughput chart */}
      <div className="shrink-0">
      <PanelCard
        title={t("metrics.messages")}
        subtitle={durationLabel}
        icon={<TrendingUp className="h-5 w-5 text-primary-400" />}
      >
        <HeroChart series={totalMessagesSeries} color="59, 130, 246" />
      </PanelCard>
      </div>

      {/* System resources */}
      <div className="shrink-0 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <UsageBar
          label={t("metrics.memoryUsed")}
          used={systemMetrics?.memory?.used || 0}
          max={systemMetrics?.memory?.max}
          usage={systemMetrics?.memory?.usage}
        />
        <UsageBar
          label={t("metrics.storageUsed")}
          used={systemMetrics?.storage?.used || 0}
          max={systemMetrics?.storage?.max}
          usage={systemMetrics?.storage?.usage}
        />
        <StatBlock
          icon={Activity}
          label={t("metrics.connections")}
          value={systemMetrics?.connections || 0}
          sub={`${systemMetrics?.streams || 0} streams · ${systemMetrics?.consumers || 0} consumers`}
          tone="emerald"
        />
        <StatBlock
          icon={Zap}
          label={t("metrics.rateWindow")}
          value={
            <>
              {formatBytes(rateTotalBytes)}
              <span className="ml-1 text-display-sm text-content-tertiary">/ {rates?.duration || 60}s</span>
            </>
          }
          sub={`${formatNumber(rateTotalMessages)} messages`}
          tone="amber"
        />
      </div>

      {/* Top streams by rate */}
      <PanelCard
        className="flex-1 min-h-0"
        title={t("metrics.rateByStream")}
        icon={<TrendingUp className="h-5 w-5 text-primary-400" />}
        empty={topStreams.length === 0}
        emptyState={
          <EmptyState
            icon={BarChart3}
            title={t("metrics.noRateData")}
            description={t("metrics.noMetricsAvailableDescription")}
          />
        }
        footer={
          <Badge variant="info">{t("metrics.streamCount", { count: rateStreams.length })}</Badge>
        }
      >
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {topStreams.map((stream: any, i: number) => (
            <TopStreamRow key={stream.name} stream={stream} max={maxRateMessages} rank={i + 1} />
          ))}
        </div>
      </PanelCard>
    </div>
  );
}
