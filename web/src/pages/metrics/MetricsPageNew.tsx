import { UseMetricsReturn } from "./hooks/useMetrics";
import { useTranslation } from "react-i18next";
import {
  Activity,
  BarChart3,
  Clock,
  Database,
  HardDrive,
  MessageSquare,
  RefreshCw,
  TrendingUp,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";

import { formatBytes, formatNumber } from "../../utils/formatters";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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

// Enhanced chart component with better visuals
function EnhancedChart({
  data,
  color,
  label,
  unit = "",
}: {
  data: { value?: number; timestamp?: number }[];
  color: string;
  label: string;
  unit?: string;
}) {
  const { t } = useTranslation();
  const chartData = data.map((p, i) => ({
    i,
    v: p.value || 0,
    ts: p.timestamp,
  }));

  if (chartData.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-center">
        <div className="icon-lg rounded-full bg-dark-border/30 flex items-center justify-center mb-3">
          <Activity className="icon-md text-dark-muted/50" />
        </div>
        <p className="text-display-xs text-dark-muted/60">{t("common.collectingData")}</p>
      </div>
    );
  }

  const currentValue = chartData[chartData.length - 1]?.v || 0;
  const previousValue = chartData[chartData.length - 2]?.v || 0;
  const change = currentValue - previousValue;
  const changePercent =
    previousValue > 0 ? ((change / previousValue) * 100) : 0;

  const ChangeIcon = change > 0 ? ArrowUpRight : change < 0 ? ArrowDownRight : Minus;
  const changeColor = change > 0 ? "text-green-400" : change < 0 ? "text-red-400" : "text-dark-muted";

  const hexColor = color.startsWith('rgb')
    ? `#${color.match(/\d+/g)?.map((n: string) => parseInt(n).toString(16).padStart(2, '0')).join('')}`
    : color;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-display-sm text-dark-muted">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-display-sm font-semibold tabular-nums">
            {unit === "bytes"
              ? formatBytes(currentValue)
              : unit === "number"
              ? formatNumber(currentValue)
              : currentValue.toFixed(2)}
          </span>
          <div className={`flex items-center gap-0.5 text-display-xs font-medium ${changeColor}`}>
            <ChangeIcon className="w-3 h-3" />
            <span>{Math.abs(changePercent).toFixed(1)}%</span>
          </div>
        </div>
      </div>
      <div className="h-24 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`chart-${hexColor}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={hexColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={hexColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="i" hide />
            <YAxis hide domain={["dataMin", "dataMax"]} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="rounded-lg border border-dark-border bg-dark-card/95 px-3 py-2 text-display-xs shadow-xl backdrop-blur">
                    <p className="text-dark-muted mb-1">{label}</p>
                    <p className="font-mono font-semibold" style={{ color: hexColor }}>
                      {unit === "bytes"
                        ? formatBytes(payload[0].value as number)
                        : unit === "number"
                        ? formatNumber(payload[0].value as number)
                        : (payload[0].value as number).toFixed(2)}
                    </p>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="v"
              stroke={hexColor}
              strokeWidth={2}
              fill={`url(#chart-${hexColor})`}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Modern stat card with trend indicator
function ModernStatCard({
  icon: Icon,
  value,
  label,
  previousValue,
  formatType = "number",
  iconBg = "bg-primary-500/20",
  iconColor = "text-primary-400",
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
  previousValue?: number;
  formatType?: "number" | "bytes";
  iconBg?: string;
  iconColor?: string;
}) {
  const change = previousValue !== undefined ? value - previousValue : 0;
  const changePercent =
    previousValue && previousValue > 0 ? ((change / previousValue) * 100) : 0;

  const ChangeIcon = change > 0 ? ArrowUpRight : change < 0 ? ArrowDownRight : Minus;
  const changeColor = change > 0 ? "text-green-400" : change < 0 ? "text-red-400" : "text-dark-muted";

  return (
    <div className="relative group">
      <div className={`card hover-lift ${iconBg}/10 border-l-4`}>
        <div className="flex items-start justify-between">
          <div className={`p-2.5 rounded-xl ${iconBg} mb-3`}>
            <Icon className={`icon-md ${iconColor}`} />
          </div>
          {previousValue !== undefined && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full bg-dark-bg/50 ${changeColor} text-display-xs font-medium`}>
              <ChangeIcon className="w-3 h-3" />
              <span>{Math.abs(changePercent).toFixed(1)}%</span>
            </div>
          )}
        </div>
        <p className="text-display-sm text-dark-muted mb-1">{label}</p>
        <p className="text-display-2xl font-bold tabular-nums">
          {formatType === "bytes" ? formatBytes(value) : formatNumber(value)}
        </p>
      </div>
    </div>
  );
}

export default function MetricsPage({
  selectedStream,
  setSelectedStream,
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
  getLatestValue,
  getSeries,
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

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header with modern styling */}
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
              className="shrink-0 min-w-[140px]"
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

      {/* Key Metrics - Modern Design */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ModernStatCard
          icon={MessageSquare}
          value={totalMessages}
          label={t("metrics.totalMessages")}
          iconBg="bg-blue-500/20"
          iconColor="text-blue-400"
          formatType="number"
        />
        <ModernStatCard
          icon={HardDrive}
          value={totalStorage}
          label={t("metrics.totalStorage")}
          iconBg="bg-purple-500/20"
          iconColor="text-purple-400"
          formatType="bytes"
        />
        <ModernStatCard
          icon={Database}
          value={streamNames.length}
          label={t("metrics.activeStreams")}
          iconBg="bg-emerald-500/20"
          iconColor="text-emerald-400"
          formatType="number"
        />
        <ModernStatCard
          icon={Zap}
          value={rateTotalMessages}
          label={t("metrics.messagesInRateWindow")}
          iconBg="bg-amber-500/20"
          iconColor="text-amber-400"
          formatType="number"
        />
      </div>

      {/* System Metrics Panel - Enhanced */}
      <PanelCard
        title={t("metrics.systemMetrics")}
        icon={<BarChart3 className="h-5 w-5 text-primary-400" />}
        className="overflow-hidden"
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Memory Usage */}
          <div className="relative group">
            <div className="card p-4 hover-lift">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Database className="icon-base text-blue-400" />
                </div>
                <span className="text-display-sm text-dark-muted">{t("metrics.memoryUsed")}</span>
              </div>
              <p className="text-display-xl font-bold mb-1">
                {formatBytes(systemMetrics?.memory?.used || 0)}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-dark-border rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      (systemMetrics?.memory?.usage || 0) > 90
                        ? "bg-red-400"
                        : (systemMetrics?.memory?.usage || 0) > 70
                        ? "bg-yellow-400"
                        : "bg-green-400"
                    }`}
                    style={{ width: `${Math.min(systemMetrics?.memory?.usage || 0, 100)}%` }}
                  />
                </div>
                <span className="text-display-xs text-dark-muted w-12 text-right">
                  {systemMetrics?.memory?.usage?.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Storage Usage */}
          <div className="relative group">
            <div className="card p-4 hover-lift">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <HardDrive className="icon-base text-purple-400" />
                </div>
                <span className="text-display-sm text-dark-muted">{t("metrics.storageUsed")}</span>
              </div>
              <p className="text-display-xl font-bold mb-1">
                {formatBytes(systemMetrics?.storage?.used || 0)}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-dark-border rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      (systemMetrics?.storage?.usage || 0) > 90
                        ? "bg-red-400"
                        : (systemMetrics?.storage?.usage || 0) > 70
                        ? "bg-yellow-400"
                        : "bg-green-400"
                    }`}
                    style={{ width: `${Math.min(systemMetrics?.storage?.usage || 0, 100)}%` }}
                  />
                </div>
                <span className="text-display-xs text-dark-muted w-12 text-right">
                  {systemMetrics?.storage?.usage?.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Connections */}
          <div className="relative group">
            <div className="card p-4 hover-lift">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <Activity className="icon-base text-emerald-400" />
                </div>
                <span className="text-display-sm text-dark-muted">{t("metrics.connections")}</span>
              </div>
              <p className="text-display-xl font-bold">{systemMetrics?.connections || 0}</p>
              <p className="text-display-xs text-dark-muted mt-1">
                {systemMetrics?.streams || 0} streams · {systemMetrics?.consumers || 0} consumers
              </p>
            </div>
          </div>

          {/* Rate */}
          <div className="relative group">
            <div className="card p-4 hover-lift">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <Zap className="icon-base text-amber-400" />
                </div>
                <span className="text-display-sm text-dark-muted">{t("metrics.rateWindow")}</span>
              </div>
              <p className="text-display-xl font-bold">
                {formatBytes(rateTotalBytes)}
                <span className="text-display-sm text-dark-muted ml-1">/ {rates?.duration || 60}s</span>
              </p>
              <p className="text-display-xs text-dark-muted mt-1">{formatNumber(rateTotalMessages)} messages</p>
            </div>
          </div>
        </div>
      </PanelCard>

      {/* Stream Metrics with Enhanced Charts */}
      <PanelCard
        title={t("metrics.streamMetrics")}
        icon={<TrendingUp className="h-5 w-5 text-primary-400" />}
        header={
          <Select
            value={selectedStream || "all"}
            onChange={(value) => setSelectedStream(value === "all" ? null : value)}
            options={[
              { value: "all", label: t("metrics.allStreams") },
              ...streamNames.map((name) => ({ value: name, label: name })),
            ]}
            className="min-w-[180px]"
            aria-label={t("metrics.selectStream")}
          />
        }
      >
        {streamNames.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title={t("metrics.noMetricsAvailable")}
            description={t("metrics.noMetricsAvailableDescription")}
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {streamNames.slice(0, 6).map((streamName) => {
              const messageSeries = getSeries(metrics, streamName, "messages");
              const bytesSeries = getSeries(metrics, streamName, "bytes");
              const messages = getLatestValue(messageSeries);

              return (
                <div
                  key={streamName}
                  className="card p-5 hover-lift space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary-500/20">
                        <MessageSquare className="icon-base text-primary-400" />
                      </div>
                      <h3 className="font-semibold text-display-sm truncate">{streamName}</h3>
                    </div>
                    <Badge variant={messages > 0 ? "success" : "default"} className="text-display-xs">
                      {formatNumber(messages)} msgs
                    </Badge>
                  </div>

                  <EnhancedChart
                    data={messageSeries?.data || []}
                    color="rgb(59, 130, 246)"
                    label={t("metrics.messages")}
                    unit="number"
                  />

                  <EnhancedChart
                    data={bytesSeries?.data || []}
                    color="rgb(16, 185, 129)"
                    label={t("metrics.storage")}
                    unit="bytes"
                  />
                </div>
              );
            })}
          </div>
        )}
      </PanelCard>

      {/* Rate by Stream - Enhanced */}
      {rateStreams.length > 0 && (
        <PanelCard
          title={t("metrics.rateByStream")}
          icon={<TrendingUp className="h-5 w-5 text-primary-400" />}
          footer={
            <div className="flex items-center gap-2">
              <Badge variant="info">{rateStreams.length}</Badge>
              <span className="text-display-sm text-dark-muted">
                {t("metrics.streamCount", { count: rateStreams.length })}
              </span>
            </div>
          }
        >
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {rateStreams.slice(0, 12).map((stream: any) => (
              <div
                key={stream.name}
                className="card p-4 hover-lift group cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-display-sm font-medium truncate mb-2 group-hover:text-primary-400 transition-colors">
                      {stream.name}
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-display-xs text-dark-muted">
                      <span>{formatNumber(stream.messages || 0)} msgs</span>
                      <span>·</span>
                      <span>{formatBytes(stream.bytes || 0)}</span>
                    </div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-primary-500/20 group-hover:bg-primary-500/30 transition-colors">
                    <TrendingUp className="icon-base text-primary-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PanelCard>
      )}
    </div>
  );
}
