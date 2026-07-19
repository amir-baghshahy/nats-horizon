import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSSE } from "../../../hooks/useSSE";
import type { SubjectInfo } from "../../../types";
import { HealthService } from "../../../types";

export interface UseSubjectsReturn {
  sseConnected: boolean;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  viewMode: "tree" | "list";
  setViewMode: React.Dispatch<React.SetStateAction<"tree" | "list">>;
  expandedNodes: Set<string>;
  refetch: () => void;
  subjects: SubjectInfo[];
  toggleNode: (path: string) => void;
  buildSubjectTree: () => Array<{
    name: string;
    count: number;
    children: SubjectInfo[];
  }>;
  filteredSubjects: SubjectInfo[];
  totalSubjects: number;
  totalMessages: number;
  lastActivity: string;
  isLoading: boolean;
  isError: boolean;
}

export function useSubjects(): UseSubjectsReturn {
  const { connected: sseConnected } = useSSE("subjects");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"tree" | "list">("tree");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const {
    data: subjectsResponse,
    refetch,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["subjects"],
    queryFn: () => HealthService.getSubjects(),
    refetchInterval: sseConnected ? false : 10000,
  });

  const subjects = subjectsResponse?.subjects || [];

  const totalSubjects = subjects.length;
  const totalMessages = subjects.reduce((sum, s) => sum + (s.count || 0), 0);
  const lastActivity = subjects.reduce((acc, s) => {
    if (!s.last_seen) return acc;
    return acc && s.last_seen < acc ? acc : s.last_seen!;
  }, "" as string);

  const toggleNode = useCallback(
    (path: string) => {
      const newExpanded = new Set(expandedNodes);
      if (newExpanded.has(path)) {
        newExpanded.delete(path);
      } else {
        newExpanded.add(path);
      }
      setExpandedNodes(newExpanded);
    },
    [expandedNodes],
  );

  const buildSubjectTree = useCallback(() => {
    const groups = new Map<
      string,
      { children: SubjectInfo[]; count: number }
    >();

    subjects.forEach((s: SubjectInfo) => {
      const subject = s.name || "";
      const parts = subject.split(".");
      const topLevel = parts[0] || "root";

      if (!groups.has(topLevel)) {
        groups.set(topLevel, { children: [], count: 0 });
      }

      const group = groups.get(topLevel)!;
      group.count += s.count || 0;
      group.children.push(s);
    });

    return Array.from(groups.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      children: data.children,
    }));
  }, [subjects]);

  const filteredSubjects = subjects.filter((s: SubjectInfo) =>
    (s.name || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return {
    sseConnected,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    expandedNodes,
    refetch,
    subjects,
    toggleNode,
    buildSubjectTree,
    filteredSubjects,
    totalSubjects,
    totalMessages,
    lastActivity,
    isLoading,
    isError,
  };
}
