import { useTranslation } from "react-i18next";
import { Settings, Eye } from "lucide-react";
import Tabs from "../../../components/ui/Tabs";

interface AlertsTabsProps {
  activeTab: "alerts" | "triggers";
  onTabChange: (tab: "alerts" | "triggers") => void;
  unackedCount: number;
}

export default function AlertsTabs({
  activeTab,
  onTabChange,
  unackedCount,
}: AlertsTabsProps) {
  const { t } = useTranslation();

  return (
    <Tabs
      tabs={[
        { id: "alerts", label: t("alerts.alertRules"), icon: Settings },
        {
          id: "triggers",
          label: t("alerts.triggeredAlerts"),
          icon: Eye,
          badge: unackedCount,
        },
      ]}
      activeTab={activeTab}
      onTabChange={(id) => onTabChange(id as "alerts" | "triggers")}
    />
  );
}
