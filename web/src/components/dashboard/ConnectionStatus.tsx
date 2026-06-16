import { Server } from "lucide-react";
import StatusBadge from "../ui/StatusBadge";
import { ConnectionStatus as ConnectionStatusType } from "../../types/nats";

interface ConnectionStatusProps {
  /**
   * Connection status
   */
  connected: boolean;

  /**
   * List of connections
   */
  connections: ConnectionStatusType[];
}

/**
 * Connection status display for dashboard
 */
export default function ConnectionStatus({
  connected,
  connections,
}: ConnectionStatusProps) {
  if (!connections || connections.length === 0) {
    return null;
  }

  return (
    <div className="card mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Connection Status</h3>
        <StatusBadge
          status={connected ? "connected" : "disconnected"}
          pulse={connected}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {connections.map((conn, idx) => (
          <div key={idx} className="bg-dark-bg/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Server className="w-4 h-4 text-primary-400" />
              <span className="font-medium">
                {conn.server || "NATS Server"}
              </span>
            </div>
            <div className="text-sm text-dark-muted space-y-1">
              <p>URL: {conn.ip || "Not connected"}</p>
              <p>
                Status:{" "}
                <span
                  className={
                    conn.status === "connected"
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {conn.status || "Disconnected"}
                </span>
              </p>
              <p>Latency: {conn.latency || "Not available"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
