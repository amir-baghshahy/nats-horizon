import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import {
  TrendingUp, Activity, MessageSquare, HardDrive,
  Clock, BarChart3, RefreshCw, Zap
} from 'lucide-react'

interface MetricDataPoint {
  timestamp: number
  value: number
}

interface MetricSeries {
  name: string
  labels: Record<string, string>
  data: MetricDataPoint[]
}

// Sparkline component for displaying mini charts
function Sparkline({ data, color, width = 200, height = 40 }: {
  data: MetricDataPoint[]
  color: string
  width?: number
  height?: number
}) {
  if (!data || data.length < 2) {
    return (
      <div
        style={{ width, height }}
        className="flex items-center justify-center text-dark-muted text-xs"
      >
        No data
      </div>
    )
  }

  const min = Math.min(...data.map(d => d.value))
  const max = Math.max(...data.map(d => d.value))
  const range = max - min || 1

  const points = data.map((point, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((point.value - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Metrics() {
  const [selectedStream, setSelectedStream] = useState<string | null>(null)
  const [duration, setDuration] = useState('1h')
  const [autoRefresh, setAutoRefresh] = useState(true)

  const { data: metrics, refetch } = useQuery({
    queryKey: ['metrics', selectedStream, duration],
    queryFn: () =>
      axios
        .get('/api/metrics', {
          params: {
            stream: selectedStream || undefined,
            duration,
          },
        })
        .then((res) => res.data),
    refetchInterval: autoRefresh ? 10000 : false,
  })

  // const { data: streamMetrics } = useQuery({
  //   queryKey: ['streamMetrics', selectedStream],
  //   queryFn: () =>
  //     selectedStream
  //       ? axios
  //           .get(`/api/metrics/streams/${selectedStream}`)
  //           .then((res) => res.data)
  //       : null,
  //   enabled: !!selectedStream,
  //   refetchInterval: autoRefresh ? 10000 : false,
  // })

  const formatBytes = (bytes: number) => {
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + ' GB'
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB'
    if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return bytes + ' B'
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  // Get unique stream names
  const streamNames = [
    ...new Set<string>(
      metrics?.streams
        ?.filter((s: MetricSeries) => s.labels.type === 'messages')
        .map((s: MetricSeries) => s.name) || []
    ),
  ]

  // Get latest values
  const getLatestValue = (streamName: string, type: string) => {
    const series = metrics?.streams?.find(
      (s: MetricSeries) => s.name === streamName && s.labels.type === type
    )
    return series?.data?.[series.data.length - 1]?.value || 0
  }

  const getTrend = (streamName: string, type: string) => {
    const series = metrics?.streams?.find(
      (s: MetricSeries) => s.name === streamName && s.labels.type === type
    )
    if (!series || series.data.length < 2) return 0

    const latest = series.data[series.data.length - 1].value
    const previous = series.data[0].value
    if (previous === 0) return 0

    return ((latest - previous) / previous) * 100
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Real-time Metrics</h1>
          <p className="text-dark-muted mt-1">
            Monitor NATS infrastructure performance and trends
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="input"
          >
            <option value="15m">Last 15 minutes</option>
            <option value="1h">Last 1 hour</option>
            <option value="6h">Last 6 hours</option>
            <option value="24h">Last 24 hours</option>
          </select>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`btn-secondary flex items-center gap-2 ${
              autoRefresh ? 'bg-primary-500/20' : ''
            }`}
          >
            {autoRefresh ? (
              <Activity className="w-4 h-4 text-green-400" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
            Auto-refresh
          </button>
          <button onClick={() => refetch()} className="btn-secondary">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {formatNumber(
                  streamNames.reduce<number>(
                    (sum, name) => sum + getLatestValue(name, 'messages'),
                    0
                  )
                )}
              </p>
              <p className="text-xs text-dark-muted">Total Messages</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {formatBytes(
                  streamNames.reduce<number>(
                    (sum, name) => sum + getLatestValue(name, 'bytes'),
                    0
                  )
                )}
              </p>
              <p className="text-xs text-dark-muted">Total Storage</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{streamNames.length}</p>
              <p className="text-xs text-dark-muted">Active Streams</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {metrics?.timestamp
                  ? new Date(metrics.timestamp * 1000).toLocaleTimeString()
                  : '--:--'}
              </p>
              <p className="text-xs text-dark-muted">Last Update</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stream Filter */}
      <div className="mb-6">
        <select
          value={selectedStream || 'all'}
          onChange={(e) => setSelectedStream(e.target.value === 'all' ? null : e.target.value)}
          className="input"
        >
          <option value="all">All Streams</option>
          {streamNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Stream Metrics */}
      <div className="grid lg:grid-cols-2 gap-6">
        {streamNames.map((streamName) => {
          const messages = getLatestValue(streamName, 'messages')
          const bytes = getLatestValue(streamName, 'bytes')
          const messageTrend = getTrend(streamName, 'messages')
          // const bytesTrend = getTrend(streamName, 'bytes')

          const messageSeries = metrics?.streams?.find(
            (s: MetricSeries) => s.name === streamName && s.labels.type === 'messages'
          )
          const bytesSeries = metrics?.streams?.find(
            (s: MetricSeries) => s.name === streamName && s.labels.type === 'bytes'
          )

          return (
            <div key={streamName} className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary-400" />
                  {streamName}
                </h3>
                <div className="flex items-center gap-2 text-sm">
                  {messageTrend !== 0 && (
                    <span
                      className={`flex items-center gap-1 ${
                        messageTrend > 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      <TrendingUp className="w-3 h-3" />
                      {Math.abs(messageTrend).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {/* Messages Chart */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-dark-muted">Messages</span>
                    <span className="font-medium">{formatNumber(messages)}</span>
                  </div>
                  {messageSeries && (
                    <Sparkline
                      data={messageSeries.data}
                      color="rgb(59, 130, 246)"
                    />
                  )}
                </div>

                {/* Bytes Chart */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-dark-muted">Storage</span>
                    <span className="font-medium">{formatBytes(bytes)}</span>
                  </div>
                  {bytesSeries && (
                    <Sparkline
                      data={bytesSeries.data}
                      color="rgb(16, 185, 129)"
                    />
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {streamNames.length === 0 && (
        <div className="card text-center py-16">
          <BarChart3 className="w-16 h-16 text-dark-muted mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Metrics Available</h3>
          <p className="text-dark-muted">
            Metrics will appear here once streams are created
          </p>
        </div>
      )}
    </div>
  )
}
