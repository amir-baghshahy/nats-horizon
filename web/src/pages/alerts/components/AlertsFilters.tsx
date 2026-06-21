import { Filter } from "lucide-react";

interface AlertsFiltersProps {
  filterSeverity: "all" | "critical" | "warning" | "info";
  onFilterChange: (severity: "all" | "critical" | "warning" | "info") => void;
}

export default function AlertsFilters({
  filterSeverity,
  onFilterChange,
}: AlertsFiltersProps) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-dark-muted" />
        <select
          value={filterSeverity}
          onChange={(e) => onFilterChange(e.target.value as any)}
          className="input"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>
      </div>
    </div>
  );
}
