import { useTranslation } from 'react-i18next';
import { CheckCircle, MessageSquare, Send, Zap } from "lucide-react";
import type { MessagingTab } from "./MessagingTabs";
import { Button } from "../ui";

interface MessagingHeaderProps {
  sseConnected: boolean;
  activeTab: MessagingTab;
  onTabChange: (tab: MessagingTab) => void;
  onPublishClick: () => void;
}

export default function MessagingHeader({
  sseConnected,
  onTabChange,
  onPublishClick,
}: MessagingHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-display-lg font-bold">{t('messages.title')}</h1>
        <p className="mt-1 text-content-tertiary">{t('messages.subtitle')}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-border-default bg-surface-primary px-4 py-2">
          {sseConnected ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-display-sm text-green-400">{t('common.sseConnected')}</span>
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="text-display-sm text-yellow-400">{t('common.polling')}</span>
            </>
          )}
        </div>

        <Button variant="primary" onClick={onPublishClick} icon={<Send className="h-4 w-4" />}>
          {t('messages.publish')}
        </Button>

        <Button
          variant="secondary"
          onClick={() => onTabChange("request")}
          icon={<MessageSquare className="h-4 w-4" />}
        >
          {t('messages.request')}
        </Button>
      </div>
    </div>
  );
}
