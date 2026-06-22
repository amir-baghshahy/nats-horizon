import { useState, useCallback, useRef } from "react";

export interface ExpansionState<T> {
  expanded: Set<T>;
  toggleExpansion: (item: T) => void;
  isExpanded: (item: T) => boolean;
}

/**
 * Hook for managing expansion state
 */
export function useExpansion<T>(): ExpansionState<T> {
  const [expanded, setExpanded] = useState<Set<T>>(new Set());
  const expandedRef = useRef(expanded);

  expandedRef.current = expanded;

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

  const isExpanded = useCallback((item: T) => expandedRef.current.has(item), []);

  return {
    expanded,
    toggleExpansion,
    isExpanded,
  };
}
