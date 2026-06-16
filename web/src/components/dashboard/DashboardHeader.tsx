import { RefreshCw, Wifi, WifiOff } from "lucide-react";

interface DashboardHeaderProps {
  /**
   * SSE connection status
   */
  sseConnected: boolean;

  /**
   * Refresh callback
   */
  onRefresh: () => void;
}

/**
 * Dashboard header with title, status, and refresh button
 */
export default function DashboardHeader({
  sseConnected,
  onRefresh,
}: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-dark-muted mt-1">NATS JetStream Overview</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-dark-bg rounded-lg border border-dark-border">
            {sseConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-yellow-400">Polling</span>
              </>
            )}
          </div>

          <button
            onClick={onRefresh}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
