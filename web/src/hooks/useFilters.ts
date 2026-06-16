import { useState, useCallback } from "react";

export interface UseFiltersOptions<T> {
  /**
   * Initial filter values
   */
  initialFilters: T;

  /**
   * Filter function (should NOT depend on filters to avoid loops)
   */
  filterFn: (item: any, filters: T) => boolean;
}

export interface UseFiltersReturn<T> {
  /**
   * Current filter values
   */
  filters: T;

  /**
   * Update filters
   */
  setFilters: (filters: T) => void;

  /**
   * Update single filter field
   */
  updateFilter: <K extends keyof T>(field: K, value: T[K]) => void;

  /**
   * Reset filters to initial values
   */
  resetFilters: () => void;

  /**
   * Apply filters to items (call filterFn dynamically)
   */
  applyFilters: (items: any[]) => any[];

  /**
   * Check if any filters are active
   */
  hasActiveFilters: () => boolean;
}

/**
 * Hook for managing filter state and logic
 */
export function useFilters<T extends Record<string, any>>(
  options: UseFiltersOptions<T>,
): UseFiltersReturn<T> {
  const { initialFilters, filterFn } = options;

  const [filters, setFilters] = useState<T>(initialFilters);

  const updateFilter = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setFilters((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const applyFilters = useCallback(
    (items: any[]) => items.filter((item) => filterFn(item, filters)),
    [filters], // Only track filters, filterFn should be stable
  );

  const hasActiveFilters = useCallback(() => {
    return Object.entries(filters).some(([key, value]) => {
      const initialValue = initialFilters[key as keyof T];
      return value !== initialValue && value !== "" && value !== "all";
    });
  }, [filters, initialFilters]);

  return {
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    applyFilters,
    hasActiveFilters,
  };
}
