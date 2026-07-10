import { HardDrive, Zap, Server, TrendingUp } from "lucide-react";
import StatCard from "../ui/StatCard";
import { getHealthStatus } from "../../utils/validators";
import { formatBytes } from "../../utils/formatters";
import { useTranslation } from "react-i18next";

interface AccountInfo {
  memory?: number;
  storage?: number;
  streams?: number;
  consumers?: number;
  api?: { total?: number; errors?: number };
  limits?: {
    max_memory?: number;
    max_storage?: number;
    max_streams?: number;
    max_consumers?: number;
  };
}

const UNLIMITED = -1;

function usagePct(used?: number, max?: number): number | null {
  if (!max || max === UNLIMITED || max <= 0) return null;
  return Math.min(100, Math.round(((used || 0) / max) * 100));
}

interface SecondaryStatsGridProps {
  account: AccountInfo;
}

export default function SecondaryStatsGrid({
  account,
}: SecondaryStatsGridProps) {
  const { t } = useTranslation();
  const apiHealthStatus = getHealthStatus(
    account.api?.total || 0,
    account.api?.errors || 0,
  );

  const apiStatusColor =
    apiHealthStatus === "success"
      ? "bg-green-500/20 text-green-400"
      : apiHealthStatus === "warning"
        ? "bg-yellow-500/20 text-yellow-400"
        : "bg-red-500/20 text-red-400";

  const errorStatusColor =
    (account.api?.errors || 0) > 0
      ? "bg-red-500/20 text-red-400"
      : "bg-green-500/20 text-green-400";

  const storagePct = usagePct(account.storage, account.limits?.max_storage);
  const memoryPct = usagePct(account.memory, account.limits?.max_memory);

  const storageLabel = storagePct !== null
    ? `${formatBytes(account.storage || 0)} / ${formatBytes(account.limits?.max_storage || 0)}`
    : formatBytes(account.storage || 0);

  const memoryLabel = memoryPct !== null
    ? `${formatBytes(account.memory || 0)} / ${formatBytes(account.limits?.max_memory || 0)}`
    : formatBytes(account.memory || 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        icon={HardDrive}
        value={storageLabel}
        label={storagePct !== null ? t('dashboard.storageUsed') + ` (${storagePct}%)` : t('dashboard.storageUsed')}
        iconBg={storagePct !== null && storagePct >= 90 ? "bg-red-500/20" : "bg-purple-500/20"}
        iconColor={storagePct !== null && storagePct >= 90 ? "text-red-400" : "text-purple-400"}
        size="small"
        formatValue={false}
      />

      <StatCard
        icon={Zap}
        value={memoryLabel}
        label={memoryPct !== null ? t('dashboard.memoryUsed') + ` (${memoryPct}%)` : t('dashboard.memoryUsed')}
        iconBg={memoryPct !== null && memoryPct >= 90 ? "bg-red-500/20" : "bg-orange-500/20"}
        iconColor={memoryPct !== null && memoryPct >= 90 ? "text-red-400" : "text-orange-400"}
        size="small"
        formatValue={false}
      />

      <StatCard
        icon={Server}
        value={account.api?.total || 0}
        label={t('dashboard.apiCalls')}
        iconBg={apiStatusColor}
        size="small"
      />

      <StatCard
        icon={TrendingUp}
        value={account.api?.errors || 0}
        label={t('dashboard.apiErrors')}
        iconBg={errorStatusColor}
        size="small"
      />
    </div>
  );
}
