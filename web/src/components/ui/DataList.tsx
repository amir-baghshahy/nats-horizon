import { LucideIcon } from "lucide-react";

interface DataListProps<T> {
  items: T[];
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  maxHeight?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  getKey: (item: T) => string;
  animate?: boolean;
}

export default function DataList<T>({
  items,
  isLoading = false,
  isEmpty = false,
  emptyIcon: EmptyIcon,
  emptyTitle = "No Data",
  emptyDescription,
  emptyAction,
  header,
  footer,
  maxHeight = 600,
  renderItem,
  getKey,
  animate = true,
}: DataListProps<T>) {
  return (
    <div
      className="card overflow-hidden flex flex-col"
      style={{ maxHeight }}
    >
      {/* Optional header */}
      {header && (
        <div className="p-4 border-b border-dark-border flex-shrink-0">{header}</div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-dark-muted">
          <div className="animate-spin icon-lg border-2 border-primary-500 border-t-transparent rounded-full mb-3" />
          <span className="text-display-sm">Loading...</span>
        </div>
      ) : isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-dark-muted">
          {EmptyIcon && <EmptyIcon className="icon-lg mb-4 opacity-50" />}
          <h3 className="text-display-lg font-semibold mb-1">{emptyTitle}</h3>
          {emptyDescription && (
            <p className="text-display-sm text-center max-w-sm mb-4">{emptyDescription}</p>
          )}
          {emptyAction}
        </div>
      ) : (
        <div className="overflow-y-auto scrollbar-thin flex-1 divide-y divide-dark-border">
          {items.map((item, index) => (
            <div
              key={getKey(item)}
              className={animate ? `animate-slide-in animate-duration-200 ${index > 0 ? `animate-delay-${Math.min(index * 50, 300)}` : ""}` : ""}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      {footer && (
        <div className="p-3 border-t border-dark-border bg-dark-bg/50 text-center text-display-sm text-dark-muted flex-shrink-0">
          {footer}
        </div>
      )}
    </div>
  );
}
