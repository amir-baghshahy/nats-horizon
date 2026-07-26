import { useToggleSet } from "./useToggleSet";

export interface SelectionState<T> {
  selected: Set<T>;
  toggleSelection: (item: T) => void;
  clearSelection: () => void;
  selectAll: (items: T[]) => void;
  isSelected: (item: T) => boolean;
}

export function useSelection<T>(): SelectionState<T> {
  const { set, toggle: toggleSelection, isPresent: isSelected, clear: clearSelection, addAll: selectAll } = useToggleSet<T>();

  return {
    selected: set,
    toggleSelection,
    clearSelection,
    selectAll,
    isSelected,
  };
}