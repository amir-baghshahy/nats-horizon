import { useState, useCallback } from "react";

interface Pagination {
  page: number;
  perPage: number;
  total: number;
}

export interface UsePaginationOptions {
  perPage?: number;
  initialPage?: number;
}

export interface UsePaginationReturn extends Pagination {
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  reset: () => void;
  getPaginatedItems: <T>(items: T[]) => T[];
  isFirstPage: boolean;
  isLastPage: boolean;
  totalPages: number;
}

export function usePagination(
  options: UsePaginationOptions = {},
): UsePaginationReturn {
  const { perPage = 20, initialPage = 1 } = options;

  const [page, setPage] = useState(initialPage);

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const nextPage = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPage((prev) => Math.max(1, prev - 1));
  }, []);

  const reset = useCallback(() => {
    setPage(1);
  }, []);

  const getPaginatedItems = useCallback(
    <T>(items: T[]): T[] => {
      const totalPages = Math.max(1, Math.ceil(items.length / perPage));
      const currentPage = Math.min(page, totalPages);

      const start = (currentPage - 1) * perPage;
      const end = start + perPage;

      return items.slice(start, end);
    },
    [page, perPage],
  );

  const totalPages = 0;
  const isFirstPage = page === 1;
  const isLastPage = page === totalPages;

  return {
    page,
    perPage,
    total: 0,
    totalPages,
    isFirstPage,
    isLastPage,
    goToPage,
    nextPage,
    prevPage,
    reset,
    getPaginatedItems,
  };
}
