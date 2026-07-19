import { useState, useCallback, useRef } from "react";

export interface SelectionState<T> {
  selected: Set<T>;
  toggleSelection: (item: T) => void;
  clearSelection: () => void;
  selectAll: (items: T[]) => void;
  isSelected: (item: T) => boolean;
}

/**
 * Hook for managing selection state
 */
export function useSelection<T>(): SelectionState<T> {
  const [selected, setSelected] = useState<Set<T>>(new Set());
  const selectedRef = useRef(selected);

  selectedRef.current = selected;

  const toggleSelection = useCallback((item: T) => {
    setSelected((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(item)) {
        newSet.delete(item);
      } else {
        newSet.add(item);
      }
      return newSet;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelected(new Set());
  }, []);

  const selectAll = useCallback((items: T[]) => {
    setSelected(new Set(items));
  }, []);

  const isSelected = useCallback(
    (item: T) => selectedRef.current.has(item),
    [],
  );

  return {
    selected,
    toggleSelection,
    clearSelection,
    selectAll,
    isSelected,
  };
}
