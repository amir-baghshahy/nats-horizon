import {
  AlertCircle,
  CheckCircle,
  Clock,
  MessageSquare,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Trash2,
  TrendingUp,
  Zap,
} from "lucide-react";
import type { ConsumerStats } from "../hooks/useConsumersPage";
import { useTranslation } from "react-i18next";
import Button from "../../../components/ui/Button";
import { PageHeader, StatCard } from "../../../components/ui";

interface ConsumersHeaderProps {
  sseConnected: boolean;
  selectedCount: number;
  pauseResumePending: boolean;
  deletePending: boolean;
  onBulkResume: () => Promise<void>;
  onBulkPause: () => Promise<void>;
  onBulkDelete: () => Promise<void>;
  onRefetch: () => void;
  onNavigateStreams: () => void;
}

export default function ConsumersHeader({
  sseConnected,
  selectedCount,
  pauseResumePending,
  deletePending,
  onBulkResume,
  onBulkPause,
  onBulkDelete,
  onRefetch,
  onNavigateStreams,
}: ConsumersHeaderProps) {
  const { t } = useTranslation();

  return (
    <PageHeader
      title={t('consumers.title')}
      subtitle={t('consumers.subtitle')}
      sseConnected={sseConnected}
      actions={
        <>
          {selectedCount > 0 && (
            <>
              <Button
                onClick={onBulkResume}
                disabled={pauseResumePending}
                variant="secondary"
                icon={<Play className="icon-base" />}
              >
                {t('consumers.resume', { count: selectedCount })}
              </Button>
              <Button
                onClick={onBulkPause}
                disabled={pauseResumePending}
                variant="secondary"
                icon={<Pause className="icon-base" />}
              >
                {t('consumers.pause', { count: selectedCount })}
              </Button>
              <Button
                onClick={onBulkDelete}
                disabled={deletePending}
                variant="secondary"
                icon={<Trash2 className="icon-base" />}
                className="text-status-error"
              >
                {t('consumers.deleteSelected', { count: selectedCount })}
              </Button>
            </>
          )}
          <Button
            onClick={onRefetch}
            variant="secondary"
            icon={<RefreshCw className="icon-base" />}
          />
          <Button
            onClick={onNavigateStreams}
            variant="primary"
            icon={<Plus className="icon-base" />}
          >
            {t('consumers.createConsumer')}
          </Button>
        </>
      }
    />
  );
}

interface ConsumersStatsProps {
  stats: ConsumerStats;
}

export function ConsumersStats({ stats }: ConsumersStatsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
      <StatCard
        icon={MessageSquare}
        value={stats.total}
        label={t('consumers.total')}
      />
      <StatCard
        icon={CheckCircle}
        value={stats.active}
        label={t('consumers.active')}
        iconBg="bg-green-500/20"
        iconColor="text-green-400"
      />
      <StatCard
        icon={AlertCircle}
        value={stats.stuck}
        label={t('consumers.stuck')}
        iconBg="bg-red-500/20"
        iconColor="text-red-400"
      />
      <StatCard
        icon={Clock}
        value={stats.idle}
        label={t('consumers.idle')}
        iconBg="bg-orange-500/20"
        iconColor="text-orange-400"
      />
      <StatCard
        icon={TrendingUp}
        value={stats.totalLag >= 1000
          ? `${(stats.totalLag / 1000).toFixed(1)}K`
          : stats.totalLag.toLocaleString()}
        label={t('consumers.totalLag')}
        iconBg="bg-purple-500/20"
        iconColor="text-purple-400"
        formatValue={false}
      />
      <StatCard
        icon={Zap}
        value={Math.floor(stats.avgAckRate)}
        label={t('consumers.avgAckRate')}
        iconBg="bg-cyan-500/20"
        iconColor="text-cyan-400"
      />
    </div>
  );
}
