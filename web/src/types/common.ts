// ============================================================================
// Common Type Definitions
// ============================================================================

/**
 * Pagination state
 */
export interface Pagination {
  page: number
  perPage: number
  total: number
}

/**
 * Filter state (generic)
 */
export interface FilterState<T> {
  search: string
  filters: T
}

/**
 * Selection state (generic)
 */
export interface SelectionState<T> {
  selected: Set<T>
  toggleSelection: (item: T) => void
  clearSelection: () => void
  selectAll: (items: T[]) => void
  isSelected: (item: T) => boolean
}

/**
 * Expansion state (generic)
 */
export interface ExpansionState<T> {
  expanded: Set<T>
  toggleExpansion: (item: T) => void
  isExpanded: (item: T) => boolean
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  data: T
  error?: string
  success: boolean
}

/**
 * Sort order
 */
export type SortOrder = 'asc' | 'desc'

/**
 * Sort option (generic)
 */
export interface SortOption<T> {
  field: T
  order: SortOrder
}

/**
 * Health status
 */
export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'unknown'

/**
 * Storage type
 */
export type StorageType = 'file' | 'memory' | 'hybrid'

/**
 * Retention policy
 */
export type RetentionPolicy = 'limits' | 'interest' | 'workqueue'

/**
 * Discard policy
 */
export type DiscardPolicy = 'old' | 'new'
