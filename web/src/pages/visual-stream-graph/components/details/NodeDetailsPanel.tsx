import { X, Database, Users, TrendingUp, Activity, Globe } from 'lucide-react'
import { formatNumber, formatBytes } from '../../../../utils/formatters'

interface GraphNode {
  id: string
  type: 'stream' | 'consumer' | 'subject'
  data: any
}

interface NodeDetailsPanelProps {
  node: GraphNode | null
  onClose: () => void
}

export function NodeDetailsPanel({ node, onClose }: NodeDetailsPanelProps) {
  if (!node) return null

  return (
    <div className="fixed right-0 top-0 h-full w-96 border-l border-border-default bg-surface-secondary shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-border-default/70 p-4 bg-surface-primary/30">
        <div className="flex items-center gap-2">
          {node.type === 'stream' ? (
            <Database className="h-5 w-5 text-primary-400" />
          ) : (
            <Users className="h-5 w-5 text-blue-400" />
          )}
          <h2 className="text-display-lg font-semibold text-content-primary truncate max-w-[200px]">
            {node.data.name}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-content-tertiary transition-colors hover:bg-surface-primary hover:text-content-primary"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {node.type === 'stream' ? (
          <StreamDetails data={node.data} />
        ) : (
          <ConsumerDetails data={node.data} />
        )}
      </div>
    </div>
  )
}

function StreamDetails({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      {/* Health Status */}
      <div className="rounded-xl border border-border-default/60 bg-surface-primary/50 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-display-sm text-content-tertiary">Health Status</span>
          <span className={`text-display-xs font-medium capitalize ${
            data.health === 'critical' ? 'text-red-400' :
            data.health === 'warning' ? 'text-orange-400' :
            'text-green-400'
          }`}>
            {data.health}
          </span>
        </div>
      </div>

      {/* Statistics */}
      <div className="rounded-xl border border-border-default/60 bg-surface-primary/50 p-4">
        <h3 className="text-display-sm font-medium text-content-primary mb-3 flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary-400" />
          Statistics
        </h3>
        <div className="space-y-3 text-display-sm">
          <div className="flex items-center justify-between">
            <span className="text-content-tertiary">Messages</span>
            <span className="font-medium text-content-primary tabular-nums">
              {formatNumber(data.messageCount || 0)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-content-tertiary">Consumers</span>
            <span className="font-medium text-content-primary tabular-nums">
              {data.consumerCount || 0}
            </span>
          </div>
          {data.storage !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-content-tertiary">Storage Used</span>
              <span className="font-medium text-content-primary tabular-nums">
                {formatBytes(data.storage)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Subjects */}
      {data.subjects && data.subjects.length > 0 && (
        <div className="rounded-xl border border-border-default/60 bg-surface-primary/50 p-4">
          <h3 className="text-display-sm font-medium text-content-primary mb-3 flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-400" />
            Subjects ({data.subjects.length})
          </h3>
          <div className="space-y-2">
            {data.subjects.map((subject: string, idx: number) => (
              <div
                key={idx}
                className="px-3 py-2 rounded-lg bg-surface-primary border border-border-default/40 font-mono text-display-xs text-content-tertiary break-all"
              >
                {subject}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ConsumerDetails({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      {/* Health Status */}
      <div className="rounded-xl border border-border-default/60 bg-surface-primary/50 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-display-sm text-content-tertiary">Health Status</span>
          <span className={`text-display-xs font-medium capitalize ${
            data.health === 'critical' ? 'text-red-400' :
            data.health === 'warning' ? 'text-orange-400' :
            'text-green-400'
          }`}>
            {data.health}
          </span>
        </div>
      </div>

      {/* Performance */}
      <div className="rounded-xl border border-border-default/60 bg-surface-primary/50 p-4">
        <h3 className="text-display-sm font-medium text-content-primary mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary-400" />
          Performance
        </h3>
        <div className="space-y-3 text-display-sm">
          <div className="flex items-center justify-between">
            <span className="text-content-tertiary">Consumer Lag</span>
            <span className={`font-medium tabular-nums ${
              data.lag > 1000 ? 'text-orange-400' : 'text-green-400'
            }`}>
              {formatNumber(data.lag || 0)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-content-tertiary">Ack Rate</span>
            <span className="font-medium text-content-primary tabular-nums">
              {data.ackRate || '0'}/s
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-content-tertiary">Status</span>
            <span className={`font-medium capitalize ${
              data.status === 'paused' ? 'text-orange-400' : 'text-green-400'
            }`}>
              {data.status || 'unknown'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
