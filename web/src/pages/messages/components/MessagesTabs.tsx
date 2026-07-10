import { useTranslation } from "react-i18next";
import { Tabs } from "../../../components/ui";

interface MessagesTabsProps {
  activeTab: "stream" | "core";
  onTabChange: (tab: "stream" | "core") => void;
}

export default function MessagesTabs({ activeTab, onTabChange }: MessagesTabsProps) {
  const { t } = useTranslation();
  
  return (
    <Tabs
      tabs={[
        { id: "stream", label: t('messages.streamMessages') },
        { id: "core", label: t('messages.coreMessaging') },
      ]}
      activeTab={activeTab}
      onTabChange={onTabChange}
      variant="pill"
    />
  );
}
