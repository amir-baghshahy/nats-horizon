interface PanelCardProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  maxHeight?: number;
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  empty?: boolean;
  emptyState?: React.ReactNode;
}

export default function PanelCard({
  title,
  subtitle,
  icon,
  header,
  footer,
  maxHeight = 500,
  children,
  className = "",
  loading = false,
  empty = false,
  emptyState,
}: PanelCardProps) {
  return (
    <div
      className={`card overflow-hidden flex flex-col ${className}`}
      style={{ maxHeight }}
    >
      {/* Header */}
      {(header || title) && (
        <div className="p-4 border-b border-dark-border bg-dark-bg/50 flex-shrink-0">
          {header || (
            <div className="flex items-center gap-3">
              {icon && (
                <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center shrink-0">
                  {icon}
                </div>
              )}
              <div>
                <h3 className="text-base font-semibold">{title}</h3>
                {subtitle && <p className="text-xs text-dark-muted">{subtitle}</p>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full" />
        </div>
      ) : empty ? (
        <div className="flex-1 flex items-center justify-center p-8">
          {emptyState}
        </div>
      ) : (
        <div className="overflow-y-auto scrollbar-thin flex-1 p-4">{children}</div>
      )}

      {/* Footer */}
      {footer && (
        <div className="p-3 border-t border-dark-border bg-dark-bg/50 text-center text-sm text-dark-muted flex-shrink-0">
          {footer}
        </div>
      )}
    </div>
  );
}
