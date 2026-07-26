import { useState, useCallback, useRef } from "react";

export interface UseToggleSetReturn<T> {
  set: Set<T>;
  toggle: (item: T) => void;
  isPresent: (item: T) => boolean;
  clear: () => void;
  addAll: (items: T[]) => void;
}

export function useToggleSet<T>(): UseToggleSetReturn<T> {
  const [set, setSet] = useState<Set<T>>(new Set());
  const setRef = useRef(set);

  setRef.current = set;

  const toggle = useCallback((item: T) => {
    setSet((prev) => {
      const next = new Set(prev);
      if (next.has(item)) {
        next.delete(item);
      } else {
        next.add(item);
      }
      return next;
    });
  }, []);

  const isPresent = useCallback(
    (item: T) => setRef.current.has(item),
    [],
  );

  const clear = useCallback(() => {
    setSet(new Set());
  }, []);

  const addAll = useCallback((items: T[]) => {
    setSet(new Set(items));
  }, []);

  return {
    set,
    toggle,
    isPresent,
    clear,
    addAll,
  };
}