import { Link } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  MessageSquare,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { StatusBadge } from "../../../components/ui";
import { formatBytes } from "../../../utils/formatters";
import type { Stream } from "../hooks/useStreamsPage";

interface StreamRowProps {
  stream: Stream;
  streamName: string;
  healthStatus: "all" | "healthy" | "warning" | "critical";
  isItemSelected: boolean;
  isItemExpanded: boolean;
  toggleSelection: (item: string) => void;
  toggleExpansion: (item: string) => void;
  onViewDetails: (streamName: string) => void;
  onDelete: (streamName: string) => Promise<void>;
  onPurge: (streamName: string) => Promise<void>;
  onExportStream: (streamName: string, format?: "json" | "csv" | "txt") => void;
  onExportMessages: (streamName: string, subject?: string) => void;
}

export default function StreamRow({
  stream,
  streamName,
  healthStatus,
  isItemSelected,
  isItemExpanded,
  toggleSelection,
  toggleExpansion,
  onViewDetails,
  onDelete,
  onPurge,
  onExportStream,
  onExportMessages,
}: StreamRowProps) {
  return (
    <div className={isItemSelected ? "bg-primary-500/5" : ""}>
      <div className="p-4 hover:bg-dark-bg/50 transition-all hover-lift">
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            checked={isItemSelected}
            onChange={() => toggleSelection(streamName)}
            className="w-4 h-4"
          />

          <button
            onClick={() => toggleExpansion(streamName)}
            className="p-1 hover:bg-dark-bg rounded transition-colors"
          >
            {isItemExpanded ? (
              <ChevronDown className="w-4 h-4 text-dark-muted" />
            ) : (
              <ChevronRight className="w-4 h-4 text-dark-muted" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <Link
                to={`/streams/${encodeURIComponent(streamName)}`}
                className="font-mono text-sm text-primary-400 hover:underline"
              >
                {streamName}
              </Link>

              <StatusBadge
                status={
                  healthStatus === "healthy"
                    ? "success"
                    : healthStatus === "warning"
                      ? "warning"
                      : "error"
                }
                size="small"
              />

              <span className="text-xs text-dark-muted">
                {stream.config?.storage === "file" ? "File" : "Memory"}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-dark-muted">
              <span>{stream.state?.messages?.toLocaleString() || 0} messages</span>
              <span>{formatBytes(stream.state?.bytes || 0)}</span>
              <span>{stream.state?.consumers || 0} consumers</span>

              {(stream.state?.num_pending || 0) > 0 && (
                <span className="text-yellow-400">
                  {stream.state?.num_pending?.toLocaleString()} pending
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewDetails(streamName)}
              className="p-2 hover:bg-dark-bg rounded-lg hover-lift active-scale transition-colors"
              title="View details"
            >
              <Eye className="w-4 h-4 text-dark-muted" />
            </button>

            <button
              onClick={() => onExportStream(streamName, "json")}
              className="p-2 hover:bg-dark-bg rounded-lg hover-lift active-scale transition-colors"
              title="Export stream"
            >
              <Download className="w-4 h-4 text-dark-muted" />
            </button>

            <button
              onClick={() => onExportMessages(streamName)}
              className="p-2 hover:bg-dark-bg rounded-lg hover-lift active-scale transition-colors"
              title="Export messages"
            >
              <MessageSquare className="w-4 h-4 text-dark-muted" />
            </button>

            <button
              onClick={() => onPurge(streamName)}
              className="p-2 hover:bg-dark-bg rounded-lg hover-lift active-scale transition-colors"
              title="Purge messages"
            >
              <RefreshCw className="w-4 h-4 text-dark-muted" />
            </button>

            <button
              onClick={() => onDelete(streamName)}
              className="p-2 hover:bg-red-500/20 rounded-lg hover-lift active-scale transition-colors"
              title="Delete stream"
            >
              <Trash2 className="w-4 h-4 text-dark-muted hover:text-red-400" />
            </button>
          </div>
        </div>

        {isItemExpanded && (
          <div className="mt-4 pl-10 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm animate-fade-in-down">
            <div className="bg-dark-bg/50 rounded-lg p-3 hover-scale">
              <p className="text-xs text-dark-muted mb-1">Subjects</p>
              <div className="space-y-1">
                {stream.config?.subjects?.map((subject: string) => (
                  <code key={subject} className="text-xs text-primary-400">
                    {subject}
                  </code>
                ))}
              </div>
            </div>

            <div className="bg-dark-bg/50 rounded-lg p-3 hover-scale">
              <p className="text-xs text-dark-muted mb-1">Configuration</p>
              <div className="space-y-1">
                <p>Replicas: {stream.config?.replicas}</p>
                <p>Retention: {stream.config?.retention}</p>
                <p>Max Age: {stream.config?.max_age}s</p>
              </div>
            </div>

            <div className="bg-dark-bg/50 rounded-lg p-3 hover-scale">
              <p className="text-xs text-dark-muted mb-1">State</p>
              <div className="space-y-1">
                <p>First Seq: {stream.state?.first_seq?.toLocaleString() || 0}</p>
                <p>Last Seq: {stream.state?.last_seq?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
