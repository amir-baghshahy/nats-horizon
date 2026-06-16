interface BulkAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: "danger" | "primary" | "secondary";
}

interface BulkActionsProps {
  /**
   * Number of selected items
   */
  selectedCount: number;

  /**
   * Total number of items
   */
  totalCount: number;

  /**
   * Available actions
   */
  actions: BulkAction[];

  /**
   * Select all callback
   */
  onSelectAll: () => void;

  /**
   * Clear selection callback
   */
  onClearSelection: () => void;
}

/**
 * Reusable bulk actions bar
 */
export default function BulkActions({
  selectedCount,
  totalCount,
  actions,
  onClearSelection,
}: BulkActionsProps) {
  if (selectedCount === 0) {
    return null;
  }

  const variantClasses = {
    danger: "bg-red-500/20 text-red-400 hover:bg-red-500/30",
    primary: "bg-primary-500/20 text-primary-400 hover:bg-primary-500/30",
    secondary: "bg-dark-bg text-dark-text hover:bg-dark-bg/80",
  };

  return (
    <div className="flex items-center justify-between p-4 bg-primary-500/10 border border-primary-500/30 rounded-lg mb-4">
      <div className="text-sm">
        <span className="font-medium">{selectedCount}</span>
        <span className="text-dark-muted mx-2">of</span>
        <span className="text-dark-muted">{totalCount}</span>
        <span className="text-dark-muted mx-2">selected</span>
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
            <action.icon className="w-4 h-4" />
            <span className="text-sm">{action.label}</span>
          </button>
        ))}

        <button
          onClick={onClearSelection}
          className="text-sm text-dark-muted hover:text-dark-text transition-colors"
        >
          Clear selection
        </button>
      </div>
    </div>
  );
}
