import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Eye,
  Pause,
  Play,
} from "lucide-react";
import type { ConsumerResponse as Consumer } from "../../../types";
import { Button } from "../../../components/ui";

interface ConsumerRowProps {
  consumer: Consumer;
  isSelected: boolean;
  isExpanded: boolean;
  resetLagPending: boolean;
  onToggleSelection: (name: string) => void;
  onToggleExpansion: (name: string) => void;
  onTogglePauseResume: (consumer: Consumer) => void;
  onViewDetails: (name: string) => void;
  onResetLag: (consumer: Consumer) => void;
  onDelete: (consumer: Consumer) => void;
  getStatusIcon: (consumer: Consumer) => JSX.Element;
  getStatusLabel: (status: string) => string;
  getLagColor: (lag: number) => string;
}

export default function ConsumerRow({
  consumer,
  isSelected,
  isExpanded,
  resetLagPending,
  onToggleSelection,
  onToggleExpansion,
  onTogglePauseResume,
  onViewDetails,
  onResetLag,
  onDelete,
  getStatusIcon,
  getStatusLabel,
  getLagColor,
}: ConsumerRowProps) {
  const { t } = useTranslation();

  const consumerName = consumer.name || "";
  if (!consumerName) return null;

  return (
    <div className="border-s-2 border-s-transparent hover:border-s-primary-500 transition-colors">
      <div className="p-4 hover:bg-dark-bg/50 transition-colors">
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelection(consumerName)}
            className="w-4 h-4 rounded"
          />

          <button
            onClick={() => onToggleExpansion(consumerName)}
            className="p-1 hover:bg-dark-bg rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-dark-muted" />
            ) : (
              <ChevronRight className="w-4 h-4 text-dark-muted" />
            )}
          </button>

          <div className="flex items-center gap-2">
            {getStatusIcon(consumer)}
            <span className="text-sm">{getStatusLabel(consumer.status || "")}</span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-medium">{consumerName}</p>
            <div className="flex items-center gap-2 mt-1">
              <Link
                to={`/streams/${encodeURIComponent(consumer.stream || "")}`}
                className="text-xs text-primary-400 hover:underline"
              >
                {consumer.stream}
              </Link>
              {consumer.config?.durable && (
                <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">
                  Durable
                </span>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 text-sm">
            <div className="text-center">
              <p className={`font-medium ${getLagColor(consumer.lag || 0)}`}>
                {(consumer.lag || 0).toLocaleString()}
              </p>
              <p className="text-xs text-dark-muted">{t("consumers.totalLag")}</p>
            </div>
            <div className="text-center">
              <p className="font-medium">{consumer.ack_rate || t("common.na")}</p>
              <p className="text-xs text-dark-muted">{t("consumers.avgAckRate")}</p>
            </div>
            <div className="text-center">
              <p className="font-medium">{consumer.num_pending || consumer.lag || 0}</p>
              <p className="text-xs text-dark-muted">{t("consumers.pending")}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onTogglePauseResume(consumer)}
              className="p-2 hover:bg-dark-bg rounded-lg transition-colors"
              title={
                !consumer.paused
                  ? t("consumers.pauseConsumer")
                  : t("consumers.resumeConsumer")
              }
            >
              {!consumer.paused ? (
                <Pause className="w-4 h-4 text-dark-muted" />
              ) : (
                <Play className="w-4 h-4 text-dark-muted" />
              )}
            </button>
            <Link
              to={`/consumers/${encodeURIComponent(consumer.name || "")}`}
              className="p-2 hover:bg-dark-bg rounded-lg transition-colors"
              title={t("common.viewDetails")}
            >
              <Eye className="w-4 h-4 text-dark-muted" />
            </Link>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 ps-8 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-dark-bg/50 rounded-lg p-3">
                <p className="text-xs text-dark-muted">{t("consumers.deliveryPolicy")}</p>
                <p className="font-medium">{(consumer.config as { delivery?: string })?.delivery || "all"}</p>
              </div>
              <div className="bg-dark-bg/50 rounded-lg p-3">
                <p className="text-xs text-dark-muted">{t("consumers.ackPolicy")}</p>
                <p className="font-medium">{consumer.config?.ack_policy || "explicit"}</p>
              </div>
              <div className="bg-dark-bg/50 rounded-lg p-3">
                <p className="text-xs text-dark-muted">{t("consumers.replayPolicy")}</p>
                <p className="font-medium">{consumer.config?.replay_policy || "instant"}</p>
              </div>
              <div className="bg-dark-bg/50 rounded-lg p-3">
                <p className="text-xs text-dark-muted">{t("consumers.maxDeliveries")}</p>
                <p className="font-medium">{consumer.config?.max_deliver || "-1"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button variant="secondary" size="sm" onClick={() => onViewDetails(consumerName)}>
                {t("consumers.editConfiguration")}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => onViewDetails(consumerName)}>
                {t("consumers.viewMessages")}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => onResetLag(consumer)} disabled={resetLagPending}>
                {t("consumers.resetLag")}
              </Button>
              <Button variant="secondary" size="sm" className="text-status-error" onClick={() => onDelete(consumer)}>
                {t("consumers.deleteConsumerBtn")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
