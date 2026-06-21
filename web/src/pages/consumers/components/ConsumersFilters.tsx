import { Filter, Search } from "lucide-react";
import type { ConsumerFilterStatus } from "../hooks/useConsumersPage";

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
  return (
    <div className="card mb-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col xl:flex-row xl:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-muted" />
            <input
              type="text"
              placeholder="Search consumers by name or stream..."
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              className="input pl-11"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:w-[420px] xl:flex-none">
            <select
              value={selectedStream}
              onChange={(event) => onStreamChange(event.target.value)}
              className="input"
            >
              <option value="all">All Streams</option>
              {streamOptions.map((streamName) => (
                <option key={streamName} value={streamName}>
                  {streamName}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(event) =>
                onStatusChange(event.target.value as ConsumerFilterStatus)
              }
              className="input"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="stuck">Stuck</option>
              <option value="idle">Idle</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-dark-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-dark-muted">Filters:</span>
            {activeFilterCount === 0 ? (
              <span className="rounded-full bg-dark-bg px-3 py-1 text-xs text-dark-muted">
                Showing all consumers
              </span>
            ) : null}
            {searchQuery ? (
              <span className="rounded-full bg-primary-500/15 px-3 py-1 text-xs text-primary-300 ring-1 ring-primary-500/30">
                Search: {searchQuery}
              </span>
            ) : null}
            {selectedStream !== "all" ? (
              <span className="rounded-full bg-primary-500/15 px-3 py-1 text-xs text-primary-300 ring-1 ring-primary-500/30">
                Stream: {selectedStream}
              </span>
            ) : null}
            {filterStatus !== "all" ? (
              <span className="rounded-full bg-primary-500/15 px-3 py-1 text-xs text-primary-300 ring-1 ring-primary-500/30">
                Status: {getStatusLabel(filterStatus)}
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={onClear}
              disabled={activeFilterCount === 0}
              className="btn-secondary"
            >
              Clear filters
            </button>
            <button onClick={onShowMoreFiltersToggle} className="btn-secondary">
              <Filter className="h-4 w-4" />
              {showMoreFilters ? "Less Filters" : "More Filters"}
            </button>
          </div>
        </div>

        {showMoreFilters && (
          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-dark-border/50 bg-dark-bg/40 p-4 md:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-dark-muted">Quick status</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => onStatusChange(status)}
                    className={`rounded-xl px-3 py-2 text-xs font-medium ring-1 transition-all ${
                      filterStatus === status
                        ? "bg-primary-600 text-white ring-primary-500/50"
                        : "bg-dark-card text-dark-muted ring-dark-border hover:bg-dark-border hover:text-dark-text"
                    }`}
                  >
                    {status === "all" ? "All" : getStatusLabel(status)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-dark-muted">Stream</p>
              <select
                value={selectedStream}
                onChange={(event) => onStreamChange(event.target.value)}
                className="input mt-3"
              >
                <option value="all">All Streams</option>
                {streamOptions.map((streamName) => (
                  <option key={streamName} value={streamName}>
                    {streamName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-xs font-medium text-dark-muted">Search</p>
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Type to filter..."
                className="input mt-3"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
