import { useEffect, useState, useRef, useMemo, useCallback, memo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { HealthService, MetricsService } from "../types";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  HardDrive,
  Cpu,
} from "lucide-react";
import { AreaChart, Area, Tooltip, YAxis } from "recharts";
import { formatBytes } from "../utils/formatters";

interface DataPoint {
  timestamp: number;
  value: number;
}

interface MetricsGraphProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  queryKey: string[];
  queryFn: () => Promise<any>;
  getValue: (data: any) => number;
  maxPoints?: number;
  formatValue?: (v: number) => string;
}

const DEFAULT_FORMAT = (v: number) => v.toLocaleString();

const TOOLTIP_STYLE: React.CSSProperties = {
  borderRadius: "0.5rem",
  border: "1px solid var(--tw-colors-border-default, #334155)",
  backgroundColor: "rgba(30, 41, 59, 0.95)",
  padding: "0.25rem 0.5rem",
  fontSize: "0.75rem",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
};

function ChartTooltip({
  active,
  payload,
  formatValue,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  formatValue: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={TOOLTIP_STYLE}>
      <span
        className="font-mono"
        style={{ color: "var(--tw-colors-primary-400, #38bdf8)" }}
      >
        {formatValue(payload[0].value as number)}
      </span>
    </div>
  );
}

const MetricsGraph = memo(function MetricsGraph({
  title,
  icon,
  color,
  queryKey,
  queryFn,
  getValue,
  maxPoints = 30,
  formatValue = DEFAULT_FORMAT,
}: MetricsGraphProps) {
  const { t } = useTranslation();
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);

  const getValueRef = useRef(getValue);
  getValueRef.current = getValue;

  const { data } = useQuery({
    queryKey,
    queryFn,
    refetchInterval: 10000,
    staleTime: 5000,
  });

  useEffect(() => {
    if (data == null) return;
    try {
      const value = getValueRef.current(data);
      const now = Date.now();
      setDataPoints((prev) => {
        const updated = [...prev, { timestamp: now, value }];
        return updated.length > maxPoints ? updated.slice(-maxPoints) : updated;
      });
    } catch (err) {
      console.error("Failed to extract value for metrics graph:", err);
    }
  }, [data, maxPoints]);

  const chartData = useMemo(
    () => dataPoints.map((p) => ({ t: p.timestamp, v: p.value })),
    [dataPoints],
  );

  const hexColor = useMemo(
    () => (color.startsWith("rgb") ? rgbToHex(color) : color),
    [color],
  );

  const currentValue =
    dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].value : 0;
  const previousValue =
    dataPoints.length > 1
      ? dataPoints[dataPoints.length - 2].value
      : currentValue;
  const change = currentValue - previousValue;
  const changePercent = previousValue > 0 ? (change / previousValue) * 100 : 0;

  const isPositiveGood =
    title === t("messages.messagesLabel") ||
    title === t("messages.messageRate");
  const trendColor =
    change > 0
      ? isPositiveGood
        ? "text-green-400"
        : "text-red-400"
      : change < 0
        ? isPositiveGood
          ? "text-red-400"
          : "text-green-400"
        : "text-content-tertiary";

  const gradientId = useMemo(() => `grad-${hexColor}`, [hexColor]);

  return (
    <div className="card flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{
              backgroundColor: color
                .replace(")", ", 0.15)")
                .replace("rgb", "rgba"),
            }}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-display-xs text-content-tertiary truncate leading-tight">
              {title}
            </p>
            <p className="text-display-base font-bold leading-tight tabular-nums">
              {formatValue(currentValue)}
            </p>
          </div>
        </div>
        <div
          className={`flex items-center gap-0.5 text-display-xs font-medium ${trendColor}`}
        >
          {change > 0 ? (
            <TrendingUp className="w-3 h-3" />
          ) : change < 0 ? (
            <TrendingDown className="w-3 h-3" />
          ) : null}
          <span>
            {change >= 0 ? "+" : ""}
            {changePercent.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="h-16 w-full">
        {chartData.length >= 2 ? (
          <AreaChart
            data={chartData}
            margin={{ top: 2, right: 2, left: 2, bottom: 2 }}
            width={400}
            height={64}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={hexColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={hexColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis domain={["dataMin", "dataMax"]} hide />
            <Tooltip content={<ChartTooltip formatValue={formatValue} />} />
            <Area
              type="monotone"
              dataKey="v"
              stroke={hexColor}
              strokeWidth={1.5}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </AreaChart>
        ) : (
          <div className="flex h-full items-center justify-center text-display-xs text-content-tertiary/60">
            {t("common.collectingData") || "Collecting data…"}
          </div>
        )}
      </div>
    </div>
  );
});

function rgbToHex(rgb: string): string {
  const match = rgb.match(/\d+/g);
  if (!match || match.length < 3) return "#94a3b8";
  const [r, g, b] = match.map(Number);
  return "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("");
}

export function SystemMetrics() {
  const { t } = useTranslation();

  const getDashboardStats = useCallback(
    () => HealthService.getDashboardStats(),
    [],
  );
  const getMessagesValue = useCallback((data: any) => data?.messages || 0, []);
  const getMemoryValue = useCallback(
    (data: any) => data?.memory?.used || 0,
    [],
  );
  const getStorageValue = useCallback(
    (data: any) => data?.storage?.used || 0,
    [],
  );
  const getSystemMetrics = useCallback(
    () => MetricsService.getMetricsSystem(),
    [],
  );
  const getRateMetrics = useCallback(
    () => MetricsService.getMetricsRates(),
    [],
  );
  const getRateValue = useCallback(
    (data: any) =>
      data?.streams?.reduce(
        (sum: number, s: any) => sum + (s?.messages_per_sec || 0),
        0,
      ) || 0,
    [],
  );

  const messagesIcon = useMemo(
    () => <Activity className="icon-base text-green-400" />,
    [],
  );
  const memoryIcon = useMemo(
    () => <Cpu className="icon-base text-orange-400" />,
    [],
  );
  const storageIcon = useMemo(
    () => <HardDrive className="icon-base text-purple-400" />,
    [],
  );
  const rateIcon = useMemo(
    () => <TrendingUp className="icon-base text-cyan-400" />,
    [],
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <MetricsGraph
        title={t("messages.messagesLabel")}
        icon={messagesIcon}
        color="rgb(74, 222, 128)"
        queryKey={["dashboardStats"]}
        queryFn={getDashboardStats}
        getValue={getMessagesValue}
      />
      <MetricsGraph
        title={t("common.memory")}
        icon={memoryIcon}
        color="rgb(251, 146, 60)"
        queryKey={["systemMetrics"]}
        queryFn={getSystemMetrics}
        getValue={getMemoryValue}
        formatValue={(v) =>
          v >= 1048576
            ? `${(v / 1048576).toFixed(1)}MB`
            : v >= 1024
              ? `${(v / 1024).toFixed(0)}KB`
              : `${v}B`
        }
      />
      <MetricsGraph
        title={t("common.storage")}
        icon={storageIcon}
        color="rgb(192, 132, 252)"
        queryKey={["systemMetrics-storage"]}
        queryFn={getSystemMetrics}
        getValue={getStorageValue}
        formatValue={(v) =>
          v >= 1048576
            ? `${(v / 1048576).toFixed(1)}MB`
            : v >= 1024
              ? `${(v / 1024).toFixed(0)}KB`
              : `${v}B`
        }
      />
      <MetricsGraph
        title={t("messages.messageRate")}
        icon={rateIcon}
        color="rgb(34, 211, 238)"
        queryKey={["rateMetrics"]}
        queryFn={getRateMetrics}
        getValue={getRateValue}
        formatValue={(v) => `${v.toFixed(1)} msg/s`}
      />
    </div>
  );
}

export function ResourceUsageBar({
  label,
  used,
  max,
  color,
}: {
  label: string;
  used: number;
  max: number;
  color: string;
}) {
  const { t } = useTranslation();
  const percentage = max > 0 ? (used / max) * 100 : 0;

  return (
    <div className="bg-surface-primary rounded-lg p-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-display-xs font-medium">{label}</span>
        <span className="text-display-xs text-content-tertiary">
          {formatBytes(used)} / {formatBytes(max)}
        </span>
      </div>
      <div className="w-full bg-border-default rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full transition-all duration-500 rounded-full"
          style={{
            width: `${Math.min(percentage, 100)}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <div className="flex items-center justify-between mt-1">
        <span
          className={`text-display-xs ${percentage > 90 ? "text-red-400" : percentage > 70 ? "text-yellow-400" : "text-green-400"}`}
        >
          {percentage.toFixed(1)}%
        </span>
        <span className="text-display-xs text-content-tertiary">
          {percentage > 90
            ? t("common.critical")
            : percentage > 70
              ? t("common.warning")
              : t("common.healthy")}
        </span>
      </div>
    </div>
  );
}
