import { UseHistoryReturn } from "./hooks/useHistory";
import { useTranslation } from "react-i18next";
import { BarChart3, History as HistoryIcon, RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react";
import EmptyState from "../../components/ui/EmptyState";
import Select from "../../components/ui/Select";
import { PageHeader } from "../../components/ui";
import { Button } from "../../components/ui";
import { formatBytes } from "../../utils/formatters";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

const DURATIONS = ["1h", "6h", "24h", "7d"];

function formatTime(ts: number) {
  return new Date(ts * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function HistoryPage({
  duration,
  setDuration,
  selectedStream,
  setSelectedStream,
  refetch,
  streamOptions,
  historyStreams,
  streamHistoryPoints,
}: UseHistoryReturn) {
  const { t } = useTranslation();

  const maxMessages = Math.max(...historyStreams.map((s: any) => s.messages || 0), 1);

  const chartData = streamHistoryPoints.map((p: any) => ({
    t: p.timestamp,
    v: p.value || 0,
    label: formatTime(p.timestamp),
  }));

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 md:h-full md:overflow-hidden">
      <div className="shrink-0">
      <PageHeader
        title={t("history.title")}
        subtitle={t("history.subtitle")}
        icon={HistoryIcon}
        actions={
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className="h-3.5 w-3.5" />}
            onClick={() => refetch()}
          >
            {t("common.refresh")}
          </Button>
        }
      />
      </div>

      {/* Filters */}
      <div className="shrink-0 flex flex-wrap items-center gap-3">
        {/* Duration toggle buttons */}
        <div className="flex items-center rounded-lg border border-border-default/60 bg-surface-primary/50 p-0.5 gap-0.5">
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`rounded-md px-3 py-1 text-display-xs font-medium transition-colors ${
                duration === d
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-content-tertiary hover:text-content-primary"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Stream selector */}
        <Select
          value={selectedStream}
          onChange={setSelectedStream}
          options={[
            { value: "all", label: t("history.allStreams") },
            ...streamOptions.map((name: any) => ({ value: name, label: name })),
          ]}
          aria-label={t("history.stream")}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 min-h-0 grid gap-4 lg:grid-cols-5">
        {/* Stream summary table — 2/5 */}
        <div className="lg:col-span-2 card flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-3 shrink-0">
            <HistoryIcon className="h-4 w-4 text-primary-400" />
            <h3 className="text-display-sm font-semibold">{t("history.streamSummary")}</h3>
            <span className="ml-auto text-display-xs text-content-tertiary">
              {historyStreams.length} {t("common.streams") || "streams"}
            </span>
          </div>

          {historyStreams.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title={t("history.noHistoryData")}
              description={t("history.noHistoryDataDescription")}
            />
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin space-y-2 pe-0.5">
              {historyStreams.map((stream: any, idx: number) => {
                const pct = Math.round(((stream.messages || 0) / maxMessages) * 100);
                const trend = stream.trend;
                const TrendIcon =
                  trend === "up" ? TrendingUp
                  : trend === "down" ? TrendingDown
                  : Minus;
                const trendColor =
                  trend === "up" ? "text-green-400"
                  : trend === "down" ? "text-red-400"
                  : "text-content-tertiary";

                return (
                  <div
                    key={stream.name || idx}
                    className="group rounded-lg bg-surface-primary/40 px-3 py-2.5 hover:bg-surface-primary/70 transition-colors cursor-pointer"
                    onClick={() => setSelectedStream(stream.name || "all")}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-display-xs font-medium truncate max-w-[120px]" title={stream.name}>
                        {stream.name}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <TrendIcon className={`h-3 w-3 ${trendColor}`} />
                        <span className="text-display-xs tabular-nums text-content-tertiary">
                          {(stream.messages || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {/* mini bar */}
                    <div className="h-1 w-full rounded-full bg-border-default/50 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary-500/70 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-display-xs text-content-tertiary/70">{formatBytes(stream.bytes || 0)}</span>
                      <span className="text-display-xs text-content-tertiary/70">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Timeline chart — 3/5 */}
        <div className="lg:col-span-3 card flex flex-col min-h-0 overflow-y-auto scrollbar-thin">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-primary-400" />
            <h3 className="text-display-sm font-semibold">{t("history.messagesTrend")}</h3>
            {selectedStream !== "all" && (
              <span className="ml-1 text-display-xs px-2 py-0.5 rounded-full bg-primary-500/15 text-primary-400">
                {selectedStream}
              </span>
            )}
            <span className="ml-auto text-display-xs text-content-tertiary">
              {chartData.length} {t("history.dataPoints") || "points"}
            </span>
          </div>

          {chartData.length < 2 ? (
            <EmptyState
              icon={BarChart3}
              title={t("history.noStreamTrend")}
              description={selectedStream === "all"
                ? (t("history.selectStreamForTrend") || "Select a stream to view its trend")
                : t("history.noStreamTrendDescription")}
            />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(51,65,85,0.4)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                    tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="rounded-lg border border-border-default bg-surface-secondary/95 px-3 py-2 text-display-xs shadow-lg backdrop-blur">
                          <p className="text-content-tertiary mb-1">{label}</p>
                          <p className="font-semibold text-primary-400 tabular-nums">
                            {(payload[0].value as number).toLocaleString()} {t("common.messages") || "messages"}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="#38bdf8"
                    strokeWidth={1.5}
                    fill="url(#histGrad)"
                    dot={false}
                    activeDot={{ r: 3, fill: "#38bdf8", strokeWidth: 0 }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Summary row under chart */}
          {chartData.length >= 2 && (() => {
            const values = chartData.map((p: any) => p.v);
            const min = Math.min(...values);
            const max = Math.max(...values);
            const avg = Math.round(values.reduce((s: number, v: number) => s + v, 0) / values.length);
            const last = values[values.length - 1];
            return (
              <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-border-default/40">
                {[
                  { label: t("history.min", { defaultValue: "Min" }), value: min.toLocaleString() },
                  { label: t("history.max", { defaultValue: "Max" }), value: max.toLocaleString() },
                  { label: t("history.avg", { defaultValue: "Avg" }), value: avg.toLocaleString() },
                  { label: t("history.latest", { defaultValue: "Latest" }), value: last.toLocaleString() },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center">
                    <p className="text-display-xs text-content-tertiary">{label}</p>
                    <p className="text-display-xs font-semibold tabular-nums mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
