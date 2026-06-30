import { useTranslation } from "react-i18next";
import type { StreamStats } from "../hooks/useStreamsPage";
import { Database, HardDrive, MessageSquare, Users } from "lucide-react";
import { StatCard } from "../../../components/ui";

interface StreamsStatsProps {
  stats: StreamStats;
}

export default function StreamsStats({ stats }: StreamsStatsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
      <StatCard icon={Database} value={stats.total} label={t("streams.totalStreams")} />
      <StatCard icon={HardDrive} value={stats.fileStorage} label={t("streams.fileStorage")} iconBg="bg-blue-500/20" iconColor="text-blue-400" />
      <StatCard icon={Database} value={stats.memoryStorage} label={t("streams.memoryStorage")} iconBg="bg-purple-500/20" iconColor="text-purple-400" />
      <StatCard icon={MessageSquare} value={stats.totalMessages} label={t("streams.totalMessages")} iconBg="bg-green-500/20" iconColor="text-green-400" />
      <StatCard icon={Users} value={stats.totalConsumers} label={t("streams.totalConsumers")} iconBg="bg-cyan-500/20" iconColor="text-cyan-400" />
    </div>
  );
}
