import { LucideIcon } from "lucide-react";
import LiveIndicator from "./LiveIndicator";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  sseConnected?: boolean;
  actions?: React.ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  sseConnected,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4 gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        {Icon && (
          <div className="avatar rounded-lg bg-primary-500/20 flex items-center justify-center shrink-0">
            <Icon className="icon-base text-primary-400" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-display-lg font-bold leading-tight truncate">{title}</h1>
          {subtitle && <p className="text-display-xs text-content-tertiary truncate">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {sseConnected !== undefined && (
          <LiveIndicator
            connected={sseConnected}
            className={!sseConnected ? "opacity-80" : ""}
          />
        )}
        {actions}
      </div>
    </div>
  );
}
