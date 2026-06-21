import {
  AlertCircle,
  CheckCircle,
  Clock,
  MessageSquare,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Trash2,
  TrendingUp,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";
import type { ConsumerStats } from "../hooks/useConsumersPage";

interface ConsumersHeaderProps {
  sseConnected: boolean;
  selectedCount: number;
  pauseResumePending: boolean;
  deletePending: boolean;
  onBulkResume: () => Promise<void>;
  onBulkPause: () => Promise<void>;
  onBulkDelete: () => Promise<void>;
  onRefetch: () => void;
  onNavigateStreams: () => void;
}

export default function ConsumersHeader({
  sseConnected,
  selectedCount,
  pauseResumePending,
  deletePending,
  onBulkResume,
  onBulkPause,
  onBulkDelete,
  onRefetch,
  onNavigateStreams,
}: ConsumersHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Consumers</h1>
        <p className="text-dark-muted mt-1">Monitor and manage JetStream consumers</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-dark-bg rounded-lg border border-dark-border text-xs">
          {sseConnected ? (
            <>
              <Wifi className="w-3.5 h-3.5 status-success" />
              <span className="text-status-success">Live</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 status-warning" />
              <span className="text-status-warning">Connecting...</span>
            </>
          )}
        </div>

        {selectedCount > 0 && (
          <>
            <button
              onClick={onBulkResume}
              disabled={pauseResumePending}
              className="btn-secondary flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Resume ({selectedCount})
            </button>
            <button
              onClick={onBulkPause}
              disabled={pauseResumePending}
              className="btn-secondary flex items-center gap-2"
            >
              <Pause className="w-4 h-4" />
              Pause ({selectedCount})
            </button>
            <button
              onClick={onBulkDelete}
              disabled={deletePending}
              className="btn-secondary flex items-center gap-2 text-status-error"
            >
              <Trash2 className="w-4 h-4" />
              Delete ({selectedCount})
            </button>
          </>
        )}
        <button onClick={onRefetch} className="btn-secondary">
          <RefreshCw className="w-4 h-4" />
        </button>
        <button onClick={onNavigateStreams} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Consumer
        </button>
      </div>
    </div>
  );
}

interface ConsumersStatsProps {
  stats: ConsumerStats;
}

export function ConsumersStats({ stats }: ConsumersStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <div className="card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-dark-muted">Total</p>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.active}</p>
            <p className="text-xs text-dark-muted">Active</p>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.stuck}</p>
            <p className="text-xs text-dark-muted">Stuck</p>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.idle}</p>
            <p className="text-xs text-dark-muted">Idle</p>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">
              {stats.totalLag >= 1000
                ? `${(stats.totalLag / 1000).toFixed(1)}K`
                : stats.totalLag.toLocaleString()}
            </p>
            <p className="text-xs text-dark-muted">Total Lag</p>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{Math.floor(stats.avgAckRate)}</p>
            <p className="text-xs text-dark-muted">Avg ACK/s</p>
          </div>
        </div>
      </div>
    </div>
  );
}
