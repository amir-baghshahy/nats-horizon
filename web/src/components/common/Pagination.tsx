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

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="text-display-sm text-content-tertiary">
        {t('common.showing', { start: startItem, end: endItem, total })}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage}
          className="p-2 rounded-lg border border-border-default hover:bg-surface-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label={t('common.previousPage')}
        >
          <ChevronLeft className="icon-base" />
        </button>

        {getPageNumbers().map((p, idx) =>
          typeof p === 'number' ? (
            <button
              key={idx}
              onClick={() => onPageChange(p)}
              className={`min-w-[2rem] h-8 rounded-lg border text-display-sm font-medium transition-colors ${
                p === page
                  ? "bg-primary-600 border-primary-600 text-white"
                  : "border-border-default hover:bg-surface-primary"
              }`}
            >
              {p}
            </button>
          ) : (
            <span key={idx} className="px-1 text-content-tertiary text-display-sm">...</span>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="p-2 rounded-lg border border-border-default hover:bg-surface-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label={t('common.nextPage')}
        >
          <ChevronRight className="icon-base" />
        </button>
      </div>
    </div>
  );
}
