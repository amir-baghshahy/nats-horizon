import { Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface FilterBadge {
  label: string;
  value: string;
  onRemove?: () => void;
}

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  badges?: FilterBadge[];
  onClearFilters?: () => void;
  actions?: React.ReactNode;
}

export default function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters,
  badges,
  onClearFilters,
  actions,
}: FilterBarProps) {
  const { t } = useTranslation();
  const placeholder = searchPlaceholder ?? t("common.search");
  const hasActiveBadges = badges && badges.length > 0;

  return (
    <div className="card mb-4">
      <div className="flex flex-col gap-3">
        {/* Search and filters row */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 icon-base text-content-tertiary" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={placeholder}
              aria-label={placeholder}
              className="input w-full ps-10"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label={t("common.clear")}
                className="absolute end-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-content-tertiary transition-colors hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <X className="icon-base" />
              </button>
            )}
          </div>
          {filters}
        </div>

        {/* Badges row */}
        {(hasActiveBadges || actions) && (
          <div className="flex flex-col gap-3 border-t border-border-default/60 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {badges?.map((badge, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full bg-primary-500/15 px-2.5 py-1 text-display-xs text-primary-300"
                >
                  <span className="text-content-tertiary">{badge.label}:</span>
                  {badge.value}
                  {badge.onRemove && (
                    <button
                      type="button"
                      onClick={badge.onRemove}
                      aria-label={`${t("common.remove")} ${badge.label}`}
                      className="ms-1 rounded transition-colors hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    >
                      <X className="icon-sm" />
                    </button>
                  )}
                </span>
              ))}
              {hasActiveBadges && onClearFilters && (
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="rounded text-display-xs text-content-tertiary transition-colors hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  {t("common.clear")}
                </button>
              )}
            </div>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
