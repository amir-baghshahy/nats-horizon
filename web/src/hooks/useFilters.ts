import { useState, useCallback } from "react";

export interface UseFiltersOptions<T> {
  initialFilters: T;
  filterFn: (item: any, filters: T) => boolean;
}

export interface UseFiltersReturn<T> {
  filters: T;
  setFilters: (filters: T) => void;
  updateFilter: <K extends keyof T>(field: K, value: T[K]) => void;
  resetFilters: () => void;
  applyFilters: (items: any[]) => any[];
  hasActiveFilters: boolean;
}

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
    [filters],
  );

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    const initialValue = initialFilters[key as keyof T];
    return value !== initialValue && value !== "" && value !== "all";
  });

  return {
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    applyFilters,
    hasActiveFilters,
  };
}
