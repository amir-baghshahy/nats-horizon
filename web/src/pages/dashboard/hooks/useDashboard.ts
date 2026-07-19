import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSSE } from "../../../hooks/useSSE";
import {
  ConsumersService,
  HealthService,
  ClusterService,
} from "../../../types";
import type {
  DashboardStatsResponse,
  ClusterHealthResponse,
} from "../../../types";

export interface UseDashboardReturn {
  sseConnected: boolean;
  stats: DashboardStatsResponse;
  accountInfo: any;
  connections: any;
  consumers: any;
  clusterHealth?: ClusterHealthResponse;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useDashboard(): UseDashboardReturn {
  const { connected: sseConnected } = useSSE("dashboard");
  const isTabVisibleRef = useRef(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      isTabVisibleRef.current = !document.hidden;
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const {
    data: stats,
    refetch,
    isLoading: statsLoading,
    isError: statsError,
  } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: () => HealthService.getDashboardStats(),
    refetchInterval: sseConnected ? false : 5000,
  });

  const {
    data: accountInfo,
    isLoading: accountLoading,
    isError: accountError,
  } = useQuery({
    queryKey: ["accountInfo"],
    queryFn: () => HealthService.getAccountInfo(),
    refetchInterval: sseConnected ? false : 5000,
  });

  const {
    data: connections,
    isLoading: connectionsLoading,
    isError: connectionsError,
  } = useQuery({
    queryKey: ["connections"],
    queryFn: () => HealthService.getConnections(),
    refetchInterval: sseConnected ? false : 10000,
  });

  const {
    data: consumers,
    isLoading: consumersLoading,
    isError: consumersError,
  } = useQuery({
    queryKey: ["consumers"],
    queryFn: () => ConsumersService.getConsumers(),
    refetchInterval: sseConnected ? false : 5000,
  });

  const { data: clusterHealth } = useQuery({
    queryKey: ["clusterHealth"],
    queryFn: () => ClusterService.getClusterHealth(),
    refetchInterval: sseConnected ? false : 10000,
    retry: 1,
  });

  const isLoading =
    statsLoading || accountLoading || connectionsLoading || consumersLoading;
  const isError =
    statsError || accountError || connectionsError || consumersError;

  const dashboardStats: DashboardStatsResponse = stats || {
    streams: 0,
    consumers: 0,
    messages: 0,
    connections: 0,
    bytes: 0,
    server_status: "disconnected",
  };

  const account = accountInfo || {
    memory: 0,
    storage: 0,
    streams: 0,
    consumers: 0,
    cpu: 0,
    slow_consumers: 0,
  };

  return {
    sseConnected,
    stats: dashboardStats,
    accountInfo: account,
    connections,
    consumers,
    clusterHealth,
    isLoading,
    isError,
    refetch,
  };
}
