import { Search, X } from "lucide-react";

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
  searchPlaceholder = "Search...",
  filters,
  badges,
  onClearFilters,
  actions,
}: FilterBarProps) {
  const hasActiveBadges = badges && badges.length > 0;

  return (
    <div className="card mb-4">
      <div className="flex flex-col gap-3">
        {/* Search and filters row */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-muted" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="input w-full pl-10"
            />
            {searchValue && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-muted hover:text-dark-text"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {filters}
        </div>

        {/* Badges row */}
        {(hasActiveBadges || actions) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-dark-border/60">
            <div className="flex flex-wrap items-center gap-2">
              {badges?.map((badge, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-500/15 text-xs text-primary-300"
                >
                  <span className="text-dark-muted">{badge.label}:</span>
                  {badge.value}
                  {badge.onRemove && (
                    <button
                      onClick={badge.onRemove}
                      className="ml-1 hover:text-dark-text"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
              {hasActiveBadges && onClearFilters && (
                <button
                  onClick={onClearFilters}
                  className="text-xs text-dark-muted hover:text-dark-text"
                >
                  Clear all
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
