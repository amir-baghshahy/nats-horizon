import { Handle, Position, NodeProps } from "reactflow";
import {
  Database,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { formatNumber } from "../../../../utils/formatters";

export function StreamNode({ data, selected }: NodeProps) {
  const healthColor =
    data.health === "critical"
      ? "text-red-400"
      : data.health === "warning"
        ? "text-orange-400"
        : "text-green-400";

  const healthBgColor =
    data.health === "critical"
      ? "bg-red-500/20"
      : data.health === "warning"
        ? "bg-orange-500/20"
        : "bg-green-500/20";

  const HealthIcon =
    data.health === "critical"
      ? AlertTriangle
      : data.health === "warning"
        ? AlertCircle
        : CheckCircle;

  return (
    <div className="stream-node">
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-border-default !border-2 !border-content-tertiary"
      />
      <div
        className={`rounded-xl border-2 ${selected ? "border-primary-500" : "border-border-default/60"} bg-surface-secondary p-4 shadow-lg min-w-[220px] transition-all hover:shadow-xl`}
      >
        <div className="flex items-center gap-2 mb-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${healthBgColor}`}
          >
            <Database className="h-4 w-4 text-primary-400" />
          </div>
          <h3
            className="font-semibold text-content-primary truncate max-w-[140px]"
            title={data.name}
          >
            {data.name}
          </h3>
        </div>

        <div className="space-y-2 text-display-sm">
          <div className="flex items-center justify-between">
            <span className="text-content-tertiary">Messages:</span>
            <span className="font-medium text-content-primary tabular-nums">
              {formatNumber(data.messageCount || 0)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-content-tertiary">Consumers:</span>
            <span className="font-medium text-content-primary tabular-nums">
              {data.consumerCount || 0}
            </span>
          </div>

          {data.storage !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-content-tertiary">Storage:</span>
              <span className="font-medium text-content-primary tabular-nums">
                {(data.storage / 1024 / 1024).toFixed(1)} MB
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 pt-2 border-t border-border-default/60 mt-2">
            <HealthIcon className={`h-3.5 w-3.5 ${healthColor}`} />
            <span
              className={`text-display-xs font-medium capitalize ${healthColor}`}
            >
              {data.health}
            </span>
          </div>
        </div>

        {data.subjects && data.subjects.length > 0 && (
          <div className="mt-3 pt-2 border-t border-border-default/60">
            <div className="text-display-xs text-content-tertiary mb-1">
              Subjects:
            </div>
            <div className="flex flex-wrap gap-1">
              {data.subjects.slice(0, 2).map((subject: string, idx: number) => (
                <span
                  key={idx}
                  className="text-display-xs px-1.5 py-0.5 rounded bg-surface-primary/50 text-content-tertiary border border-border-default/40"
                  title={subject}
                >
                  {subject.length > 12 ? `${subject.slice(0, 12)}...` : subject}
                </span>
              ))}
              {data.subjects.length > 2 && (
                <span className="text-display-xs px-1.5 py-0.5 rounded bg-surface-primary/50 text-content-tertiary border border-border-default/40">
                  +{data.subjects.length - 2}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
