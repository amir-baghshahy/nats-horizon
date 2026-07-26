import { useToggleSet } from "./useToggleSet";

export interface ExpansionState<T> {
  expanded: Set<T>;
  toggleExpansion: (item: T) => void;
  isExpanded: (item: T) => boolean;
}

export function useExpansion<T>(): ExpansionState<T> {
  const { set, toggle: toggleExpansion, isPresent: isExpanded } =
    useToggleSet<T>();

  return {
    expanded: set,
    toggleExpansion,
    isExpanded,
  };
}