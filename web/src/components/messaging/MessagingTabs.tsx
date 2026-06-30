import { useTranslation } from 'react-i18next';
import { Tabs } from '../ui';

export type MessagingTab = "messages" | "publish" | "request" | "monitor" | "services" | "subjects";

interface MessagingTabsProps {
  activeTab: MessagingTab;
  messagesCount: number;
  onTabChange: (tab: MessagingTab) => void;
}

export default function MessagingTabs({
  activeTab,
  messagesCount,
  onTabChange,
}: MessagingTabsProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-2">
      <Tabs
        tabs={[
          { id: "messages", label: t('messages.messagesCount', { count: messagesCount }) },
          { id: "publish", label: t('messages.publish') },
          { id: "request", label: t('messages.requestReply') },
          { id: "monitor", label: t('messages.trafficMonitor') },
          { id: "subjects", label: t('messages.subjects') },
          { id: "services", label: t('messages.services') },
        ]}
        activeTab={activeTab}
        onTabChange={onTabChange}
        variant="underline"
      />
    </div>
  );
}
