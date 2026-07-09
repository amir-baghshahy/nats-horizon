import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import PanelCard from "../../../components/ui/PanelCard";
import Select from "../../../components/ui/Select";
import { Button } from "../../../components/ui";

interface MessagesPaginationProps {
  currentPage: number;
  messagesPerPage: number;
  totalMessages: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onRefresh: () => void;
}

export default function MessagesPagination({
  currentPage,
  messagesPerPage,
  totalMessages,
  onPageChange,
  onPerPageChange,
  onRefresh,
}: MessagesPaginationProps) {
  const { t } = useTranslation();
  const totalPages = Math.max(1, Math.ceil(totalMessages / messagesPerPage));

  return (
    <PanelCard className="mb-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-display-sm text-content-tertiary">
            {t('common.showing', { start: (currentPage - 1) * messagesPerPage + 1, end: Math.min(currentPage * messagesPerPage, totalMessages), total: totalMessages.toLocaleString() })}
          </span>
          <Select
            value={messagesPerPage.toString()}
            onChange={(value) => onPerPageChange(parseInt(value))}
            options={[
              { value: "25", label: t('messages.perPage', { count: 25 }) },
              { value: "50", label: t('messages.perPage', { count: 50 }) },
              { value: "100", label: t('messages.perPage', { count: 100 }) },
            ]}
            className="py-1 text-display-sm w-24"
            aria-label={t('messages.perPage', { count: messagesPerPage })}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage <= 1}>
            {t('messages.previous')}
          </Button>
          <span className="text-display-sm text-content-tertiary">
            {t('common.page', { page: currentPage, total: totalPages })}
          </span>
          <Button variant="secondary" size="sm" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage >= totalPages}>
            {t('messages.next')}
          </Button>
          <Button variant="secondary" size="sm" onClick={onRefresh} icon={<RefreshCw className="icon-base" />}>
            {t('common.refresh')}
          </Button>
        </div>
      </div>
    </PanelCard>
  );
}
