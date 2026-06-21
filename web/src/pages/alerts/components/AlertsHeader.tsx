import { ReactNode } from "react";
import { Plus, Zap } from "lucide-react";

interface AlertsHeaderProps {
  onNewAlert: () => void;
  onCheckAlerts: () => void;
  isChecking: boolean;
  rightElement?: ReactNode;
}

export default function AlertsHeader({
  onNewAlert,
  onCheckAlerts,
  isChecking,
  rightElement,
}: AlertsHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Alerts & Notifications</h1>
        <p className="text-dark-muted mt-1">
          Configure and monitor alerts for your NATS infrastructure
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onNewAlert}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Alert
        </button>
        <button
          onClick={onCheckAlerts}
          disabled={isChecking}
          className="btn-secondary flex items-center gap-2 disabled:opacity-50"
        >
          <Zap className="w-4 h-4" />
          Check Now
        </button>
        {rightElement}
      </div>
    </div>
  );
}
