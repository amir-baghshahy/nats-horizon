import { Plus, RefreshCw, Wifi, WifiOff } from "lucide-react";

interface StreamsHeaderProps {
  sseConnected: boolean;
  onShowCreateModal: () => void;
  onRefetch: () => void;
}

export default function StreamsHeader({
  sseConnected,
  onShowCreateModal,
  onRefetch,
}: StreamsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Streams</h1>
        <p className="text-dark-muted mt-1">
          Manage and monitor JetStream streams
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-dark-bg rounded-lg border border-dark-border text-xs">
          {sseConnected ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400">Live</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-yellow-400">Connecting...</span>
            </>
          )}
        </div>

        <button
          onClick={onRefetch}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>

        <button
          onClick={onShowCreateModal}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Stream
        </button>
      </div>
    </div>
  );
}
