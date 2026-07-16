import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useToast } from '../../../components/Toast'
import { useConfirm } from '../../../components/ConfirmDialog'
import { HealthService } from '../../../types'
import type { ConnectionInfo } from '../../../types'
import { REFRESH_INTERVALS } from '../../../utils/constants'

export interface UseConnectionsReturn {
  searchQuery: string
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>
  filterServer: string
  setFilterServer: React.Dispatch<React.SetStateAction<string>>
  expandedConnections: Set<number>
  isLoading: boolean
  refetch: () => void
  connections: ConnectionInfo[]
  filteredConnections: ConnectionInfo[]
  stats: {
    total: number
    uniqueUsers: number
    totalSubs: number
    avgSubs: number
    totalDataIn: number
    totalDataOut: number
    totalMsgsIn: number
    totalMsgsOut: number
    totalPending: number
  }
  servers: string[]
  serverData: Array<{ server: string; connections: number }>
  toggleExpand: (cid: number) => void
  getConnectionDuration: (connectedAt: string) => string
  toast: any
  confirm: any
}

export function useConnections(): UseConnectionsReturn {
  const { toast } = useToast()
  const { confirm } = useConfirm()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterServer, setFilterServer] = useState<string>('all')
  const [expandedConnections, setExpandedConnections] = useState<Set<number>>(new Set<number>())

  const { data: connectionsResponse, isLoading, refetch } = useQuery({
    queryKey: ['connections'],
    queryFn: () => HealthService.getConnections(),
    refetchInterval: REFRESH_INTERVALS.FAST,
  })

  const connections = connectionsResponse?.connections || []

  const filteredConnections = connections.filter((conn: ConnectionInfo) => {
    const matchesSearch =
      (conn.user || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (conn.ip || '').includes(searchQuery)

    const matchesServer =
      filterServer === 'all' || conn.server === filterServer

    return matchesSearch && matchesServer
  })

  const sum = (fn: (c: ConnectionInfo) => number | undefined) =>
    filteredConnections.reduce((acc: number, c: ConnectionInfo) => acc + (fn(c) || 0), 0)

  const totalSubs = sum((c) => c.subs_count)

  const stats = {
    total: filteredConnections.length,
    uniqueUsers: new Set(filteredConnections.map((c: ConnectionInfo) => c.user)).size,
    totalSubs,
    avgSubs: filteredConnections.length > 0 ? totalSubs / filteredConnections.length : 0,
    totalDataIn: sum((c) => c.in_bytes),
    totalDataOut: sum((c) => c.out_bytes),
    totalMsgsIn: sum((c) => c.in_msgs),
    totalMsgsOut: sum((c) => c.out_msgs),
    totalPending: sum((c) => c.pending_bytes),
  }

  const servers = [
    'all',
    ...Array.from(
      new Set(
        connections
          .map((c: ConnectionInfo) => c.server)
          .filter((server): server is string => Boolean(server)),
      ),
    ),
  ]

  const serverData = servers
    .filter((s): s is string => s !== 'all')
    .map((server) => ({
      server,
      connections: filteredConnections.filter(
        (c: ConnectionInfo) => c.server === server,
      ).length,
    }))

  const toggleExpand = useCallback((cid: number) => {
    setExpandedConnections((prev) => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(cid)) {
        newExpanded.delete(cid)
      } else {
        newExpanded.add(cid)
      }
      return newExpanded
    })
  }, [])

  const getConnectionDuration = useCallback((connectedAt: string) => {
    if (!connectedAt) return 'Not available'
    try {
      const now = new Date()
      const connected = new Date(connectedAt)
      const diff = now.getTime() - connected.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`
      if (hours > 0) return `${hours}h ${minutes}m`
      return `${minutes}m`
    } catch {
      return 'Not available'
    }
  }, [])

  return {
    searchQuery,
    setSearchQuery,
    filterServer,
    setFilterServer,
    expandedConnections,
    isLoading,
    refetch,
    connections,
    filteredConnections,
    stats,
    servers,
    serverData,
    toggleExpand,
    getConnectionDuration,
    toast,
    confirm,
  }
}
