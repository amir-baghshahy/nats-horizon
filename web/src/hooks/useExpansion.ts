import { useState, useCallback } from "react";
import { ExpansionState } from "../types/common";

/**
 * Hook for managing expansion state
 */
export function useExpansion<T>(): ExpansionState<T> {
  const [expanded, setExpanded] = useState<Set<T>>(new Set());

  const toggleExpansion = useCallback((item: T) => {
    setExpanded((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(item)) {
        newSet.delete(item);
      } else {
        newSet.add(item);
      }
      return newSet;
    });
  }, []);

  const isExpanded = useCallback((item: T) => expanded.has(item), [expanded]);

  return {
    expanded,
    toggleExpansion,
    isExpanded,
  };
}
