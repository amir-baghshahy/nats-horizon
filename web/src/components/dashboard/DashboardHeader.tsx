import { RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui";

interface DashboardHeaderProps {
  sseConnected: boolean;
  onRefresh: () => void;
}

export default function DashboardHeader({
  sseConnected,
  onRefresh,
}: DashboardHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">{t('dashboard.title')}</h1>
          <p className="text-sm text-dark-muted">{t('dashboard.subtitle')}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-bg rounded-lg border border-dark-border">
            {sseConnected ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs text-green-400">{t('common.live')}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-xs text-yellow-400">{t('common.polling')}</span>
              </>
            )}
          </div>

           <Button
             variant="secondary"
             size="sm"
             icon={<RefreshCw className="w-3.5 h-3.5" />}
             onClick={onRefresh}
           >
             {t('common.refresh')}
           </Button>
        </div>
      </div>
    </div>
  );
}
