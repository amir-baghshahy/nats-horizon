import { useNavigate } from "react-router-dom";
import { Network, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import type { ClusterHealthResponse } from "../../types";
import { useTranslation } from "react-i18next";

interface ClusterHealthCardProps {
  health?: ClusterHealthResponse;
}

export default function ClusterHealthCard({ health }: ClusterHealthCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!health) return null;

  const status = health.status || (health.connected ? "ok" : "unknown");
  const isOk = status === "ok" || status === "healthy";
  const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);

  const Icon = isOk ? CheckCircle2 : status === "degraded" ? AlertTriangle : XCircle;
  const tone = isOk
    ? "text-green-400 bg-green-500/15 ring-green-500/25"
    : status === "degraded"
      ? "text-yellow-400 bg-yellow-500/15 ring-yellow-500/25"
      : "text-red-400 bg-red-500/15 ring-red-500/25";

  return (
    <button
      onClick={() => navigate('/cluster')}
      className="card w-full text-start flex items-center justify-between gap-3 hover:-translate-y-0.5 transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-primary-500/20 flex items-center justify-center shrink-0">
          <Network className="h-3.5 w-3.5 text-primary-400" />
        </div>
        <div className="min-w-0">
          <p className="text-display-sm font-semibold leading-tight">{t('dashboard.clusterHealth', { defaultValue: 'Cluster Health' })}</p>
          <p className="text-display-xs text-content-tertiary truncate">
            {health.connected_server?.id || t('dashboard.notSpecified')}
          </p>
        </div>
      </div>
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-display-xs font-medium shrink-0 ring-1 ${tone}`}>
        <Icon className="h-3 w-3" />
        {displayStatus}
      </span>
    </button>
  );
}
