import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button, LiveIndicator } from "../ui";

interface DashboardHeaderProps {
  sseConnected: boolean;
  onRefresh: () => void;
  title?: string;
  subtitle?: string;
}

export default function DashboardHeader({
  sseConnected,
  onRefresh,
  title,
  subtitle,
}: DashboardHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between mb-4 gap-3">
      <div className="min-w-0">
        <h1 className="text-display-lg font-bold leading-tight">
          {title ?? t("dashboard.title")}
        </h1>
        <p className="text-display-xs text-content-tertiary">
          {subtitle ?? t("dashboard.subtitle")}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <LiveIndicator connected={sseConnected} />

        <Button
          variant="secondary"
          size="sm"
          icon={<RefreshCw className="icon-sm" />}
          onClick={onRefresh}
        >
          {t("common.refresh")}
        </Button>
      </div>
    </div>
  );
}
