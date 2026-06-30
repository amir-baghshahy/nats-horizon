import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Zap } from "lucide-react";
import { PageHeader } from "../../../components/ui";
import { Button } from "../../../components/ui";

interface AlertsHeaderProps {
  onNewAlert: () => void;
  onCheckAlerts: () => void;
  isChecking: boolean;
  rightElement?: ReactNode;
}

export default function AlertsHeader({
  onNewAlert,
  onCheckAlerts,
  isChecking,
  rightElement,
}: AlertsHeaderProps) {
  const { t } = useTranslation();
  return (
    <PageHeader
      title={t("alerts.title")}
      subtitle={t("alerts.subtitle")}
      actions={
        <>
           <Button
             variant="primary"
             icon={<Plus className="w-4 h-4" />}
             onClick={onNewAlert}
           >
             {t("alerts.newAlert")}
           </Button>
           <Button
             variant="secondary"
             icon={<Zap className="w-4 h-4" />}
             onClick={onCheckAlerts}
             loading={isChecking}
           >
             {t("alerts.checkNow")}
           </Button>
          {rightElement}
        </>
      }
    />
  );
}
