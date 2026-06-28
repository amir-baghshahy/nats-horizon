import { Database, Users, MessageSquare, Activity } from "lucide-react";
import StatCard from "../ui/StatCard";
import type { DashboardStatsResponse } from "../../types";
import { useTranslation } from "react-i18next";

interface StatsGridProps {
  stats: DashboardStatsResponse;
}

export default function StatsGrid({ stats }: StatsGridProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      <StatCard
        icon={Database}
        value={stats.streams || 0}
        label={t('dashboard.streams')}
        iconBg="bg-primary-500/20"
        iconColor="text-primary-400"
      />

      <StatCard
        icon={Users}
        value={stats.consumers || 0}
        label={t('dashboard.consumers')}
        iconBg="bg-blue-500/20"
        iconColor="text-blue-400"
      />

      <StatCard
        icon={MessageSquare}
        value={stats.messages || 0}
        label={t('dashboard.totalMessages')}
        iconBg="bg-green-500/20"
        iconColor="text-green-400"
      />

      <StatCard
        icon={Activity}
        value={stats.connections || 0}
        label={t('dashboard.connections')}
        iconBg="bg-cyan-500/20"
        iconColor="text-cyan-400"
      />
    </div>
  );
}
