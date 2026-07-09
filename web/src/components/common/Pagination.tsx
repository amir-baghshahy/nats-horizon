import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PaginationProps {
  page: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  perPage,
  total,
  onPageChange,
}: PaginationProps) {
  const { t } = useTranslation();
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const startItem = total === 0 ? 0 : (page - 1) * perPage + 1;
  const endItem = Math.min(page * perPage, total);

  return (
    <div className="flex items-center justify-between">
      <div className="text-display-sm text-content-tertiary">
        {t('common.showing', { start: startItem, end: endItem, total })}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage}
          className="p-2 rounded-lg border border-border-default hover:bg-surface-primary disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={t('common.previousPage')}
        >
          <ChevronLeft className="icon-base" />
        </button>

        <div className="text-display-sm">
          {t('common.page', { page, total: totalPages })}
        </div>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="p-2 rounded-lg border border-border-default hover:bg-surface-primary disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={t('common.nextPage')}
        >
          <ChevronRight className="icon-base" />
        </button>
      </div>
    </div>
  );
}
