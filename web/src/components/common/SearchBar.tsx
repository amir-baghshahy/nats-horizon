// ============================================================================
// SearchBar Component
// ============================================================================

import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder,
  className = "",
}: SearchBarProps) {
  const { t } = useTranslation();
  const defaultPlaceholder = placeholder ?? t("common.search");

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-muted" />
      <input
        type="text"
        placeholder={defaultPlaceholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input w-full pl-10"
      />
    </div>
  );
}
