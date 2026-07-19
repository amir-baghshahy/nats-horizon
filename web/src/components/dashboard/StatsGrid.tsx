import { Database, Users, MessageSquare, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatCard from "../ui/StatCard";
import type { DashboardStatsResponse } from "../../types";
import { useTranslation } from "react-i18next";

interface StatsGridProps {
  stats: DashboardStatsResponse;
  limits?: { max_streams?: number; max_consumers?: number };
}

function withQuota(label: string, used: number, max?: number): string {
  if (!max || max <= 0) return label;
  return `${label} (${Math.min(100, Math.round((used / max) * 100))}%)`;
}

export default function StatsGrid({ stats, limits }: StatsGridProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        icon={Database}
        value={stats.streams || 0}
        label={withQuota(
          t("dashboard.streams"),
          stats.streams || 0,
          limits?.max_streams,
        )}
        iconBg="bg-primary-500/20"
        iconColor="text-primary-400"
        onClick={() => navigate("/streams")}
      />

      <StatCard
        icon={Users}
        value={stats.consumers || 0}
        label={withQuota(
          t("dashboard.consumers"),
          stats.consumers || 0,
          limits?.max_consumers,
        )}
        iconBg="bg-blue-500/20"
        iconColor="text-blue-400"
        onClick={() => navigate("/consumers")}
      />

      <StatCard
        icon={MessageSquare}
        value={stats.messages || 0}
        label={t("dashboard.totalMessages")}
        iconBg="bg-green-500/20"
        iconColor="text-green-400"
        onClick={() => navigate("/messages")}
      />

      <StatCard
        icon={Activity}
        value={stats.connections || 0}
        label={t("dashboard.connections")}
        iconBg="bg-cyan-500/20"
        iconColor="text-cyan-400"
        onClick={() => navigate("/connections")}
      />
    </div>
  );
}
