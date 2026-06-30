import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  sseConnected?: boolean;
  sseLabel?: string;
  sseDisconnectedLabel?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  sseConnected,
  sseLabel,
  sseDisconnectedLabel,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-primary-400" />
          </div>
        )}
        <div>
          <h1 className="text-xl md:text-2xl font-bold">{title}</h1>
          {subtitle && <p className="text-sm text-dark-muted">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {sseConnected !== undefined && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-dark-bg rounded-lg border border-dark-border">
            {sseConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-green-400">{sseLabel || "Live"}</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-yellow-400" />
                <span className="text-xs text-yellow-400">{sseDisconnectedLabel || "Connecting..."}</span>
              </>
            )}
          </div>
        )}
        {actions}
      </div>
    </div>
  );
}
