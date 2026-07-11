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
  /** Fill the parent flex container instead of capping to maxHeight — use inside a `flex-1 min-h-0` layout. */
  fill?: boolean;
  className?: string;
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
  fill = false,
  className = "",
  renderItem,
  getKey,
  animate = true,
}: DataListProps<T>) {
  return (
    <div
      className={`card overflow-hidden flex flex-col ${fill ? "flex-1 min-h-0" : ""} ${className}`}
      style={fill ? undefined : { maxHeight }}
    >
      {/* Optional header */}
      {header && (
        <div className="p-4 border-b border-border-default flex-shrink-0">{header}</div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-content-tertiary">
          <div className="animate-spin icon-lg border-2 border-primary-500 border-t-transparent rounded-full mb-3" />
          <span className="text-display-sm">Loading...</span>
        </div>
      ) : isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-content-tertiary">
          {EmptyIcon && <EmptyIcon className="icon-lg mb-4 opacity-50" />}
          <h3 className="text-display-lg font-semibold mb-1">{emptyTitle}</h3>
          {emptyDescription && (
            <p className="text-display-sm text-center max-w-sm mb-4">{emptyDescription}</p>
          )}
          {emptyAction}
        </div>
      ) : (
        <div className="overflow-y-auto scrollbar-thin flex-1 divide-y divide-border-default">
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
        <div className="p-3 border-t border-border-default bg-surface-primary/50 text-center text-display-sm text-content-tertiary flex-shrink-0">
          {footer}
        </div>
      )}
    </div>
  );
}
