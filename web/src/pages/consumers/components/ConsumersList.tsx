import { useTranslation } from "react-i18next";
import type { ConsumerResponse as Consumer } from "../../../types";
import { DataList } from "../../../components/ui";
import ConsumerRow from "./ConsumerRow";

interface ConsumersListProps {
  consumers: Consumer[];
  isLoading: boolean;
  selectedConsumers: Set<string>;
  resetLagPending: boolean;
  onToggleAll: () => void;
  onToggleSelection: (name: string) => void;
  onToggleExpansion: (name: string) => void;
  isConsumerExpanded: (name: string) => boolean;
  onTogglePauseResume: (consumer: Consumer) => void;
  onViewDetails: (name: string) => void;
  onResetLag: (consumer: Consumer) => void;
  onDelete: (consumer: Consumer) => void;
  getStatusIcon: (consumer: Consumer) => JSX.Element;
  getStatusLabel: (status: string) => string;
  getLagColor: (lag: number) => string;
}

export default function ConsumersList({
  consumers,
  isLoading,
  selectedConsumers,
  resetLagPending,
  onToggleAll,
  onToggleSelection,
  onToggleExpansion,
  isConsumerExpanded,
  onTogglePauseResume,
  onViewDetails,
  onResetLag,
  onDelete,
  getStatusIcon,
  getStatusLabel,
  getLagColor,
}: ConsumersListProps) {
  const { t } = useTranslation();

  return (
    <DataList
      fill
      items={consumers}
      isLoading={isLoading}
      isEmpty={consumers.length === 0}
      emptyTitle={t("consumers.noConsumersFound")}
      getKey={(consumer) => consumer.name || ""}
      header={
        <div className="bg-surface-primary border-b border-border-default p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={
                  selectedConsumers.size === consumers.length &&
                  consumers.length > 0
                }
                onChange={onToggleAll}
                className="icon-base rounded"
              />
              <span className="text-display-sm text-content-tertiary">
                {selectedConsumers.size > 0
                  ? t("consumers.selectedCount", {
                      count: selectedConsumers.size,
                    })
                  : t("consumers.consumerCount", { count: consumers.length })}
              </span>
            </div>
          </div>
        </div>
      }
      renderItem={(consumer, index) => {
        const consumerName = consumer.name || "";
        if (!consumerName) return null;
        const delayClass =
          index === 0 ? "" : `animate-delay-${Math.min(index * 50, 500)}`;

        return (
          <div
            key={consumerName}
            className={`animate-slide-in animate-duration-200 ${delayClass}`}
          >
            <ConsumerRow
              consumer={consumer}
              isSelected={selectedConsumers.has(consumerName)}
              isExpanded={isConsumerExpanded(consumerName)}
              resetLagPending={resetLagPending}
              onToggleSelection={onToggleSelection}
              onToggleExpansion={onToggleExpansion}
              onTogglePauseResume={onTogglePauseResume}
              onViewDetails={onViewDetails}
              onResetLag={onResetLag}
              onDelete={onDelete}
              getStatusIcon={getStatusIcon}
              getStatusLabel={getStatusLabel}
              getLagColor={getLagColor}
            />
          </div>
        );
      }}
      footer={
        <span>{t("consumers.consumerCount", { count: consumers.length })}</span>
      }
    />
  );
}
