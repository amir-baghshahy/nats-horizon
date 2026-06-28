import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

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
    <div className="card mb-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-dark-muted">
            {t('common.showing', { start: (currentPage - 1) * messagesPerPage + 1, end: Math.min(currentPage * messagesPerPage, totalMessages), total: totalMessages.toLocaleString() })}
          </span>
          <select
            value={messagesPerPage}
            onChange={(e) => onPerPageChange(parseInt(e.target.value))}
            className="input py-1 text-sm w-24"
            aria-label={t('messages.perPage', { count: messagesPerPage })}
          >
            <option value="25">{t('messages.perPage', { count: 25 })}</option>
            <option value="50">{t('messages.perPage', { count: 50 })}</option>
            <option value="100">{t('messages.perPage', { count: 100 })}</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="btn-secondary text-sm py-1 px-3 disabled:opacity-50"
          >
            {t('messages.previous')}
          </button>
          <span className="text-sm text-dark-muted">
            {t('common.page', { page: currentPage, total: totalPages })}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="btn-secondary text-sm py-1 px-3 disabled:opacity-50"
          >
            {t('messages.next')}
          </button>
          <button
            onClick={onRefresh}
            className="btn-secondary text-sm py-1 px-3 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {t('common.refresh')}
          </button>
        </div>
      </div>
    </div>
  );
}
