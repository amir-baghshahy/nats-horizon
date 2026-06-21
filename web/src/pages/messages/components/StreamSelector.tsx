import { Search, Filter, RefreshCw } from "lucide-react";

interface StreamSelectorProps {
  streams: any[];
  selectedStream: string;
  searchQuery: string;
  showFilters: boolean;
  onStreamChange: (stream: string) => void;
  onSearchChange: (query: string) => void;
  onToggleFilters: () => void;
  onRefresh: () => void;
}

export default function StreamSelector({
  streams,
  selectedStream,
  searchQuery,
  showFilters,
  onStreamChange,
  onSearchChange,
  onToggleFilters,
  onRefresh,
}: StreamSelectorProps) {
  return (
    <div className="card mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm text-dark-muted mb-2">Select Stream</label>
          <select
            value={selectedStream}
            onChange={(e) => onStreamChange(e.target.value)}
            className="input w-full"
          >
            {streams?.map((stream: any) => (
              <option
                key={stream.config?.name || stream.name}
                value={stream.config?.name || stream.name}
              >
                {stream.config?.name || stream.name} (
                {stream.state?.messages?.toLocaleString()} messages)
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 relative">
          <label className="block text-sm text-dark-muted mb-2">Search Messages</label>
          <Search className="absolute left-3 top-9 w-4 h-4 text-dark-muted" />
          <input
            type="text"
            placeholder="Search by subject, content, or headers..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
        <div className="flex items-end gap-3">
          <button
            onClick={onToggleFilters}
            className="btn-secondary flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? "Less Filters" : "Filters"}
          </button>
          <button onClick={onRefresh} className="btn-secondary">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
