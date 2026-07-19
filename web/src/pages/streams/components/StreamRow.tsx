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
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  return (
    <div className={isItemSelected ? "bg-primary-500/5" : ""}>
      <div className="p-4 hover:bg-surface-primary/50 transition-all hover-lift">
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            checked={isItemSelected}
            onChange={() => toggleSelection(streamName)}
            className="icon-base"
          />

          <button
            onClick={() => toggleExpansion(streamName)}
            className="p-1 hover:bg-surface-primary rounded transition-colors"
          >
            {isItemExpanded ? (
              <ChevronDown className="icon-base text-content-tertiary" />
            ) : (
              <ChevronRight className="icon-base text-content-tertiary" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <Link
                to={`/streams/${encodeURIComponent(streamName)}`}
                className="font-mono text-display-sm text-primary-400 hover:underline"
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

              <span className="text-display-xs text-content-tertiary">
                {stream.config?.storage === "file"
                  ? t("streams.file")
                  : t("streams.memory")}
              </span>
            </div>

            <div className="flex items-center gap-4 text-display-sm text-content-tertiary">
              <span>
                {t("streams.messagesCount", {
                  count: stream.state?.messages || 0,
                  defaultValue: `${(stream.state?.messages || 0).toLocaleString()} messages`,
                })}
              </span>
              <span>{formatBytes(stream.state?.bytes || 0)}</span>
              <span>
                {t("streams.consumersCount", {
                  count: stream.state?.consumers || 0,
                  defaultValue: `${stream.state?.consumers || 0} consumers`,
                })}
              </span>

              {(stream.state?.num_pending || 0) > 0 && (
                <span className="text-yellow-400">
                  {t("streams.pendingCount", {
                    count: stream.state?.num_pending || 0,
                    defaultValue: `${stream.state?.num_pending?.toLocaleString()} pending`,
                  })}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewDetails(streamName)}
              className="p-2 hover:bg-surface-primary rounded-lg hover-lift active-scale transition-colors"
              title={t("streams.viewDetails", { defaultValue: "View details" })}
            >
              <Eye className="icon-base text-content-tertiary" />
            </button>

            <button
              onClick={() => onExportStream(streamName, "json")}
              className="p-2 hover:bg-surface-primary rounded-lg hover-lift active-scale transition-colors"
              title={t("streams.exportStream", {
                defaultValue: "Export stream",
              })}
            >
              <Download className="icon-base text-content-tertiary" />
            </button>

            <button
              onClick={() => onExportMessages(streamName)}
              className="p-2 hover:bg-surface-primary rounded-lg hover-lift active-scale transition-colors"
              title={t("streams.exportMessages", {
                defaultValue: "Export messages",
              })}
            >
              <MessageSquare className="icon-base text-content-tertiary" />
            </button>

            <button
              onClick={() => onPurge(streamName)}
              className="p-2 hover:bg-surface-primary rounded-lg hover-lift active-scale transition-colors"
              title={t("streams.purgeMessages", {
                defaultValue: "Purge messages",
              })}
            >
              <RefreshCw className="icon-base text-content-tertiary" />
            </button>

            <button
              onClick={() => onDelete(streamName)}
              className="p-2 hover:bg-red-500/20 rounded-lg hover-lift active-scale transition-colors"
              title={t("streams.deleteStream", {
                defaultValue: "Delete stream",
              })}
            >
              <Trash2 className="icon-base text-content-tertiary hover:text-red-400" />
            </button>
          </div>
        </div>

        {isItemExpanded && (
          <div className="mt-4 pl-10 grid grid-cols-1 md:grid-cols-3 gap-4 text-display-sm animate-fade-in-down">
            <div className="bg-surface-primary/50 rounded-lg p-3 hover-scale">
              <p className="text-display-xs text-content-tertiary mb-1">
                {t("streams.subjects")}
              </p>
              <div className="space-y-1">
                {stream.config?.subjects?.map((subject: string) => (
                  <code
                    key={subject}
                    className="text-display-xs text-primary-400"
                  >
                    {subject}
                  </code>
                ))}
              </div>
            </div>

            <div className="bg-surface-primary/50 rounded-lg p-3 hover-scale">
              <p className="text-display-xs text-content-tertiary mb-1">
                {t("streams.configuration", { defaultValue: "Configuration" })}
              </p>
              <div className="space-y-1">
                <p>
                  {t("streams.replicas")}: {stream.config?.replicas}
                </p>
                <p>
                  {t("streams.retention")}: {stream.config?.retention}
                </p>
                <p>
                  {t("streams.maxAge")}: {stream.config?.max_age}
                </p>
              </div>
            </div>

            <div className="bg-surface-primary/50 rounded-lg p-3 hover-scale">
              <p className="text-display-xs text-content-tertiary mb-1">
                {t("streams.state", { defaultValue: "State" })}
              </p>
              <div className="space-y-1">
                <p>
                  {t("streams.firstSeq", { defaultValue: "First Seq" })}:{" "}
                  {stream.state?.first_seq?.toLocaleString() || 0}
                </p>
                <p>
                  {t("streams.lastSeq", { defaultValue: "Last Seq" })}:{" "}
                  {stream.state?.last_seq?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
