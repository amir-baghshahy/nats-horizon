import { useTranslation } from "react-i18next";
import { FilterBar } from "../../../components/ui";
import Select from "../../../components/ui/Select";
import type { StreamFilters } from "../hooks/useStreamsPage";

interface StreamsFiltersProps {
  filters: StreamFilters;
  hasActiveFilters: boolean;
  updateFilter: <K extends keyof StreamFilters>(field: K, value: StreamFilters[K]) => void;
  resetFilters: () => void;
}

export default function StreamsFilters({
  filters,
  hasActiveFilters,
  updateFilter,
  resetFilters,
}: StreamsFiltersProps) {
  const { t } = useTranslation();

  return (
    <FilterBar
      searchValue={filters.search}
      onSearchChange={(value) => updateFilter("search", value)}
      searchPlaceholder={t("streams.searchPlaceholder")}
      filters={
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:w-[420px] xl:flex-none">
          <Select
            value={filters.storage}
            onChange={(value) => updateFilter("storage", value as StreamFilters["storage"])}
            options={[
              { value: "all", label: t("streams.allStorage") },
              { value: "file", label: t("streams.file") },
              { value: "memory", label: t("streams.memory") },
            ]}
            aria-label={t("streams.storage")}
          />
          <Select
            value={filters.status}
            onChange={(value) => updateFilter("status", value as StreamFilters["status"])}
            options={[
              { value: "all", label: t("streams.allStatus") },
              { value: "healthy", label: t("streams.healthy") },
              { value: "warning", label: t("streams.warning") },
              { value: "critical", label: t("streams.critical") },
            ]}
            aria-label={t("streams.status")}
          />
        </div>
      }
      onClearFilters={hasActiveFilters ? resetFilters : undefined}
    />
  );
}
