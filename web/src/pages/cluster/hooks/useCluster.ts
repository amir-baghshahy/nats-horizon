import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ClusterService, StreamsService } from '../../../types'

interface ClusterInfo {
  cluster_name: string
  is_clustered: boolean
  server_name: string
  cluster_url?: string
  jetstream: { enabled: boolean; domain?: string; tier?: number; api_level?: number }
}

interface ClusterNodes {
  nodes: Array<{ id: string; name: string; current: boolean; healthy: boolean; lag: number; active: boolean }>
  clustered: boolean
  cluster_name?: string
}

interface ClusterHealth {
  connected: boolean
  status: string
  server_status?: string
  connected_server?: { id: string; url: string }
  jetstream?: { status: string; domain?: string; tiers?: number }
}

interface StreamReplica {
  stream: string
  replicas: number
  placement?: { cluster: string; tags: string[] }
  mirror?: { name: string; domain?: string }
  sources?: Array<{ name: string; domain?: string }>
  cluster?: { name: string; replicas?: number[] }
  is_clustered: boolean
}

export interface UseClusterReturn {
  selectedStream: string | null
  setSelectedStream: React.Dispatch<React.SetStateAction<string | null>>
  clusterInfo: ClusterInfo | undefined
  clusterNodes: ClusterNodes | undefined
  clusterHealth: ClusterHealth | undefined
  streamReplicas: StreamReplica | undefined
  streams: any
  infoLoading: boolean
  nodesLoading: boolean
  healthLoading: boolean
  streamsLoading: boolean
  replicasLoading: boolean
  infoError: unknown
  nodesError: unknown
  healthError: unknown
  streamsError: unknown
  replicasError: unknown
  refreshAll: () => void
  getErrorMessage: (error: unknown) => string
  refetchReplicas: () => void
}

export function useCluster(): UseClusterReturn {
  const [selectedStream, setSelectedStream] = useState<string | null>(null)

  const { data: clusterInfo, refetch: refetchInfo, isLoading: infoLoading, error: infoError } = useQuery({
    queryKey: ['clusterInfo'],
    queryFn: () => ClusterService.getClusterInfo() as Promise<ClusterInfo>,
    refetchInterval: 10000,
  })

  const { data: clusterNodes, refetch: refetchNodes, isLoading: nodesLoading, error: nodesError } = useQuery({
    queryKey: ['clusterNodes'],
    queryFn: () => ClusterService.getClusterNodes() as Promise<ClusterNodes>,
    refetchInterval: 10000,
  })

  const { data: clusterHealth, refetch: refetchHealth, isLoading: healthLoading, error: healthError } = useQuery({
    queryKey: ['clusterHealth'],
    queryFn: () => ClusterService.getClusterHealth() as Promise<ClusterHealth>,
    refetchInterval: 5000,
  })

  const { data: streamReplicas, refetch: refetchReplicas, isLoading: replicasLoading, error: replicasError } = useQuery({
    queryKey: ['streamReplicas', selectedStream],
    queryFn: () => selectedStream
      ? ClusterService.getClusterStreamsReplicas(selectedStream) as Promise<StreamReplica>
      : Promise.resolve({} as StreamReplica),
    enabled: !!selectedStream,
  })

  const { data: streams, isLoading: streamsLoading, error: streamsError, refetch: refetchStreams } = useQuery({
    queryKey: ['streams'],
    queryFn: () => StreamsService.getStreams(),
  })

  const refreshAll = useCallback(() => {
    refetchInfo()
    refetchNodes()
    refetchHealth()
    refetchStreams()
    if (selectedStream) refetchReplicas()
  }, [refetchInfo, refetchNodes, refetchHealth, refetchStreams, refetchReplicas, selectedStream])

  const getErrorMessage = useCallback((error: unknown) => {
    if (error instanceof Error) return error.message
    return "Unable to load cluster data"
  }, [])

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
  }
}
