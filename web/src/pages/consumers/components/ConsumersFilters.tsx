import { useTranslation } from "react-i18next";
import { FilterBar, PanelCard } from "../../../components/ui";
import type { ConsumerFilterStatus } from "../hooks/useConsumersPage";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";

interface ConsumersFiltersProps {
  searchQuery: string;
  selectedStream: string;
  filterStatus: ConsumerFilterStatus;
  showMoreFilters: boolean;
  streamOptions: string[];
  activeFilterCount: number;
  onSearchChange: (value: string) => void;
  onStreamChange: (value: string) => void;
  onStatusChange: (value: ConsumerFilterStatus) => void;
  onShowMoreFiltersToggle: () => void;
  onClear: () => void;
  getStatusLabel: (status: string) => string;
}

const statusOptions = ["all", "active", "stuck", "idle"] as const;

export default function ConsumersFilters({
  searchQuery,
  selectedStream,
  filterStatus,
  showMoreFilters,
  streamOptions,
  activeFilterCount,
  onSearchChange,
  onStreamChange,
  onStatusChange,
  onShowMoreFiltersToggle,
  onClear,
  getStatusLabel,
}: ConsumersFiltersProps) {
  const { t } = useTranslation();

  return (
    <>
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={onSearchChange}
        searchPlaceholder={t("consumers.searchPlaceholder")}
        filters={
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:w-[420px] xl:flex-none">
            <Select
              value={selectedStream}
              onChange={onStreamChange}
              options={[
                { value: "all", label: t("consumers.allStreams") },
                ...streamOptions.map((name) => ({ value: name, label: name })),
              ]}
              aria-label={t("consumers.allStreams")}
            />
            <Select
              value={filterStatus}
              onChange={(value) =>
                onStatusChange(value as ConsumerFilterStatus)
              }
              options={[
                { value: "all", label: t("consumers.allStatus") },
                { value: "active", label: t("consumers.active") },
                { value: "stuck", label: t("consumers.stuck") },
                { value: "idle", label: t("consumers.idle") },
              ]}
              aria-label={t("consumers.allStatus")}
            />
          </div>
        }
        onClearFilters={activeFilterCount > 0 ? onClear : undefined}
        actions={
          <Button onClick={onShowMoreFiltersToggle} variant="secondary">
            {showMoreFilters
              ? t("consumers.lessFilters")
              : t("consumers.moreFilters")}
          </Button>
        }
      />

      {showMoreFilters && (
        <PanelCard className="mb-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <p className="text-display-xs font-medium text-content-tertiary">
                {t("consumers.quickStatus")}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => onStatusChange(status)}
                    className={`rounded-xl px-3 py-2 text-display-xs font-medium ring-1 transition-all ${
                      filterStatus === status
                        ? "bg-primary-600 text-white ring-primary-500/50"
                        : "bg-surface-secondary text-content-tertiary ring-border-default hover:bg-border-default hover:text-content-primary"
                    }`}
                  >
                    {status === "all"
                      ? t("common.all")
                      : getStatusLabel(status)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-display-xs font-medium text-content-tertiary">
                {t("consumers.stream")}
              </p>
              <Select
                value={selectedStream}
                onChange={onStreamChange}
                options={[
                  { value: "all", label: t("consumers.allStreams") },
                  ...streamOptions.map((name) => ({
                    value: name,
                    label: name,
                  })),
                ]}
                className="mt-3"
                aria-label={t("consumers.stream")}
              />
            </div>

            <div>
              <p className="text-display-xs font-medium text-content-tertiary">
                {t("common.search").replace("...", "")}
              </p>
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder={t("consumers.typeToFilter")}
                className="input mt-3"
              />
            </div>
          </div>
        </PanelCard>
      )}
    </>
  );
}
