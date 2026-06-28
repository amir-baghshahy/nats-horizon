import { Filter } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AlertsFiltersProps {
  filterSeverity: "all" | "critical" | "warning" | "info";
  onFilterChange: (severity: "all" | "critical" | "warning" | "info") => void;
}

export default function AlertsFilters({
  filterSeverity,
  onFilterChange,
}: AlertsFiltersProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-dark-muted" />
        <select
          value={filterSeverity}
          onChange={(e) => onFilterChange(e.target.value as any)}
          className="input"
        >
          <option value="all">{t("alerts.allSeverities")}</option>
          <option value="critical">{t("alerts.critical")}</option>
          <option value="warning">{t("alerts.warning")}</option>
          <option value="info">{t("alerts.info")}</option>
        </select>
      </div>
    </div>
  );
}
