import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ClusterService,
  StreamsService,
  ClusterInfoResponse,
  ClusterNodesResponse,
  ClusterHealthResponse,
  ClusterStreamReplicaResponse,
} from "../../../types";
import { REFRESH_INTERVALS } from "../../../utils/constants";

export interface UseClusterReturn {
  selectedStream: string | null;
  setSelectedStream: React.Dispatch<React.SetStateAction<string | null>>;
  clusterInfo: ClusterInfoResponse | undefined;
  clusterNodes: ClusterNodesResponse | undefined;
  clusterHealth: ClusterHealthResponse | undefined;
  streamReplicas: ClusterStreamReplicaResponse | undefined;
  streams: any;
  infoLoading: boolean;
  nodesLoading: boolean;
  healthLoading: boolean;
  streamsLoading: boolean;
  replicasLoading: boolean;
  infoError: unknown;
  nodesError: unknown;
  healthError: unknown;
  streamsError: unknown;
  replicasError: unknown;
  refreshAll: () => void;
  getErrorMessage: (error: unknown) => string;
  refetchReplicas: () => void;
}

export function useCluster(): UseClusterReturn {
  const [selectedStream, setSelectedStream] = useState<string | null>(null);

  const {
    data: clusterInfo,
    refetch: refetchInfo,
    isLoading: infoLoading,
    error: infoError,
  } = useQuery({
    queryKey: ["clusterInfo"],
    queryFn: () => ClusterService.getClusterInfo(),
    refetchInterval: REFRESH_INTERVALS.NORMAL,
  });

  const {
    data: clusterNodes,
    refetch: refetchNodes,
    isLoading: nodesLoading,
    error: nodesError,
  } = useQuery({
    queryKey: ["clusterNodes"],
    queryFn: () => ClusterService.getClusterNodes(),
    refetchInterval: REFRESH_INTERVALS.NORMAL,
  });

  const {
    data: clusterHealth,
    refetch: refetchHealth,
    isLoading: healthLoading,
    error: healthError,
  } = useQuery({
    queryKey: ["clusterHealth"],
    queryFn: () => ClusterService.getClusterHealth(),
    refetchInterval: REFRESH_INTERVALS.FAST,
  });

  const {
    data: streamReplicas,
    refetch: refetchReplicas,
    isLoading: replicasLoading,
    error: replicasError,
  } = useQuery({
    queryKey: ["streamReplicas", selectedStream],
    queryFn: () =>
      selectedStream
        ? ClusterService.getClusterStreamsReplicas(selectedStream)
        : Promise.resolve({} as ClusterStreamReplicaResponse),
    enabled: !!selectedStream,
  });

  const {
    data: streams,
    isLoading: streamsLoading,
    error: streamsError,
    refetch: refetchStreams,
  } = useQuery({
    queryKey: ["streams"],
    queryFn: () => StreamsService.getStreams(),
  });

  const refreshAll = useCallback(() => {
    refetchInfo();
    refetchNodes();
    refetchHealth();
    refetchStreams();
    if (selectedStream) refetchReplicas();
  }, [
    refetchInfo,
    refetchNodes,
    refetchHealth,
    refetchStreams,
    refetchReplicas,
    selectedStream,
  ]);

  const getErrorMessage = useCallback((error: unknown) => {
    if (error instanceof Error) return error.message;
    return "Unable to load cluster data";
  }, []);

  return {
    selectedStream,
    setSelectedStream,
    clusterInfo,
    clusterNodes,
    clusterHealth,
    streamReplicas,
    streams,
    infoLoading,
    nodesLoading,
    healthLoading,
    streamsLoading,
    replicasLoading,
    infoError,
    nodesError,
    healthError,
    streamsError,
    replicasError,
    refreshAll,
    getErrorMessage,
    refetchReplicas,
  };
}
