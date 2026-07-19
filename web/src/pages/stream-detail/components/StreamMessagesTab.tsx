import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  ChevronDown,
  ChevronRight,
  Clock,
  Code,
  Copy as CopyIcon,
  Check,
  FileText,
  RefreshCw,
  Search,
  Trash2,
  MessageSquare,
} from "lucide-react";
import { MessagesService, type StreamMessage } from "../../../types";
import { PanelCard, EmptyState, Button } from "../../../components/ui";
import { useToast } from "../../../components/Toast";
import { useConfirm } from "../../../components/ConfirmDialog";
import { formatBytes } from "../../../utils/formatters";

const MAX_DISPLAY_PAYLOAD_SIZE = 50 * 1024;
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function relTime(ts?: string): string {
  if (!ts) return "—";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "—";
  const diff = Date.now() - d.getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function StreamMessagesTab({ stream }: { stream: string }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState<number | null>(null);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["stream-messages", stream, page, pageSize],
    queryFn: () => MessagesService.getMessagesPage(stream, page, pageSize),
    placeholderData: (prev) => prev,
  });

  const messages = data?.messages || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const filtered = search
    ? messages.filter(
        (m) =>
          (m.subject || "").toLowerCase().includes(search.toLowerCase()) ||
          (m.data || "").toLowerCase().includes(search.toLowerCase()),
      )
    : messages;

  const toggle = (seq: number) =>
    setExpanded((prev) => {
      const n = new Set(prev);
      n.has(seq) ? n.delete(seq) : n.add(seq);
      return n;
    });

  const copy = (payload: string, seq: number) => {
    navigator.clipboard.writeText(payload);
    setCopied(seq);
    setTimeout(() => setCopied(null), 1500);
  };

  const del = async (seq: number) => {
    const ok = await confirm({
      title: t("messages.deleteMessage"),
      message: t("messages.deleteConfirm", {
        defaultValue: "Delete message #{{seq}}?",
        seq,
      }),
      confirmLabel: t("common.delete"),
      variant: "danger",
    });
    if (!ok) return;
    try {
      await MessagesService.deleteStreamsMessages(stream, String(seq));
      toast(
        "success",
        t("messages.messageDeleted", { defaultValue: "Message deleted" }),
      );
      refetch();
    } catch {
      toast(
        "error",
        t("messages.deleteFailed", {
          defaultValue: "Failed to delete message",
        }),
      );
    }
  };

  return (
    <PanelCard
      className="flex-1 min-h-0"
      header={
        <div className="bg-surface-primary border-b border-border-default p-4 flex-shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-[200px]">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 icon-base text-content-tertiary" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("streams.searchMessagesPlaceholder")}
                  className="input pl-10 w-full"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="input py-1.5"
              >
                {PAGE_SIZE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {t("messages.perPage", {
                      count: s,
                      defaultValue: "{{count}} / page",
                    })}
                  </option>
                ))}
              </select>
              <Button
                variant="secondary"
                size="sm"
                icon={
                  <RefreshCw
                    className={`icon-base ${isFetching ? "animate-spin" : ""}`}
                  />
                }
                onClick={() => refetch()}
              />
            </div>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <span>
            {t("messages.showingRange", {
              defaultValue: "{{count}} of {{total}} messages",
              count: filtered.length,
              total,
            })}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              {t("common.previous", { defaultValue: "Previous" })}
            </Button>
            <span className="text-display-xs text-content-tertiary tabular-nums">
              {t("common.pageOf", {
                defaultValue: "Page {{page}} / {{total}}",
                page,
                total: totalPages,
              })}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              {t("common.next", { defaultValue: "Next" })}
            </Button>
          </div>
        </div>
      }
    >
      {isLoading ? (
        <div className="p-6 text-center text-content-tertiary">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
          {t("common.loading")}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title={t("messages.noMessagesYet")}
          description={t("messages.noMessagesYetDescription")}
        />
      ) : (
        <div className="overflow-y-auto scrollbar-thin flex-1 min-h-0 divide-y divide-border-default">
          {filtered.map((message: StreamMessage) => {
            const seq = message.sequence ?? 0;
            const isExpanded = expanded.has(seq);
            const payload = message.data || "";
            const headers = message.headers || {};

            return (
              <div
                key={seq}
                className="border-l-2 border-l-transparent hover:border-l-primary-500 transition-colors"
              >
                <div className="p-4 hover:bg-surface-primary/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggle(seq)}
                      className="p-1 hover:bg-surface-primary rounded transition-colors mt-0.5"
                    >
                      {isExpanded ? (
                        <ChevronDown className="icon-base text-content-tertiary" />
                      ) : (
                        <ChevronRight className="icon-base text-content-tertiary" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <span className="font-mono text-display-sm text-primary-400">
                          #{seq}
                        </span>
                        <span className="text-display-sm font-medium truncate">
                          {message.subject}
                        </span>
                        <span className="text-display-xs text-content-tertiary">
                          {formatBytes(message.size || 0)}
                        </span>
                        <span className="text-display-xs text-content-tertiary flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {relTime(message.timestamp)}
                        </span>
                        {Object.keys(headers).length > 0 && (
                          <span className="text-display-xs text-content-tertiary flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {t("messages.headersCount", {
                              defaultValue: "{{count}} headers",
                              count: Object.keys(headers).length,
                            })}
                          </span>
                        )}
                      </div>
                      <div className="text-display-sm text-content-tertiary truncate font-mono">
                        {payload.substring(0, 120) || (
                          <span className="italic">
                            {t("messages.emptyPayload", {
                              defaultValue: "(empty)",
                            })}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => copy(payload, seq)}
                        className="p-2 hover:bg-surface-primary rounded-lg"
                        title={t("messages.copyMessage")}
                      >
                        {copied === seq ? (
                          <Check className="icon-base text-green-400" />
                        ) : (
                          <CopyIcon className="icon-base text-content-tertiary" />
                        )}
                      </button>
                      <button
                        onClick={() => del(seq)}
                        className="p-2 hover:bg-red-500/20 rounded-lg text-status-error"
                        title={t("messages.deleteMessage")}
                      >
                        <Trash2 className="icon-base" />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pl-8 space-y-4 animate-fade-in-down">
                      {Object.keys(headers).length > 0 && (
                        <div className="bg-surface-primary/50 rounded-lg p-4">
                          <h4 className="text-display-sm font-medium mb-3 flex items-center gap-2">
                            <FileText className="icon-base" />
                            {t("messages.headers")}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-display-sm">
                            {Object.entries(headers).map(([key, value]) => (
                              <div key={key} className="flex gap-2">
                                <span className="text-content-tertiary">
                                  {key}:
                                </span>
                                <span className="font-mono text-display-xs break-all">
                                  {value.join(", ")}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="bg-surface-primary/50 rounded-lg p-4">
                        <h4 className="text-display-sm font-medium flex items-center gap-2 mb-3">
                          <Code className="icon-base" />
                          {t("messages.payload")}
                        </h4>
                        <pre className="text-display-sm bg-surface-primary p-3 rounded overflow-x-auto max-h-96">
                          <code className="text-green-400">
                            {payload.length > MAX_DISPLAY_PAYLOAD_SIZE
                              ? payload.slice(0, MAX_DISPLAY_PAYLOAD_SIZE) +
                                t("messages.truncated")
                              : payload ||
                                t("messages.emptyPayload", {
                                  defaultValue: "(empty)",
                                })}
                          </code>
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PanelCard>
  );
}
