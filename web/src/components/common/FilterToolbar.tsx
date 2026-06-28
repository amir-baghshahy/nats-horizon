import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

interface FilterToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  children?: ReactNode;
  badges?: ReactNode;
  actions?: ReactNode;
}

export default function FilterToolbar({
  searchValue,
  onSearchChange,
  placeholder,
  children,
  badges,
  actions,
}: FilterToolbarProps) {
  const { t } = useTranslation();
  const defaultPlaceholder = placeholder ?? t('common.search');

  return (
    <div className="card mb-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col xl:flex-row xl:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-muted" />
            <input
              type="text"
              placeholder={defaultPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="input pl-11"
            />
          </div>
          {children}
        </div>

        <div className="flex flex-col gap-3 border-t border-dark-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-dark-muted">{t('common.filters')}</span>
            {badges}
          </div>
          {actions}
        </div>
      </div>
    </div>
  );
}
