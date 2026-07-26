import React from "react";
import { useTranslation } from "react-i18next";

interface BulkAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: "danger" | "primary" | "secondary";
}

interface BulkActionsProps {
  selectedCount: number;
  totalCount: number;
  actions: BulkAction[];
  onSelectAll: () => void;
  onClearSelection: () => void;
}

export default function BulkActions({
  selectedCount,
  totalCount,
  actions,
  onClearSelection,
}: BulkActionsProps) {
  const { t } = useTranslation();

  if (selectedCount === 0) {
    return null;
  }

  const variantClasses = {
    danger: "bg-red-500/20 text-red-400 hover:bg-red-500/30",
    primary: "bg-primary-500/20 text-primary-400 hover:bg-primary-500/30",
    secondary:
      "bg-surface-primary text-content-primary hover:bg-surface-primary/80",
  };

  return (
    <div className="flex items-center justify-between p-4 bg-primary-500/10 border border-primary-500/30 rounded-lg mb-4">
      <div className="text-display-sm">
        <span className="font-medium">{selectedCount}</span>
        <span className="text-content-tertiary mx-2">{t("common.of")}</span>
        <span className="text-content-tertiary">{totalCount}</span>
        <span className="text-content-tertiary mx-2">
          {t("common.selected")}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              variantClasses[action.variant || "secondary"]
            }`}
          >
            <action.icon className="icon-base" />
            <span className="text-display-sm">{action.label}</span>
          </button>
        ))}

        <button
          onClick={onClearSelection}
          className="text-display-sm text-content-tertiary hover:text-content-primary transition-colors"
        >
          {t("common.clearSelection")}
        </button>
      </div>
    </div>
  );
}
