// ============================================================================
// Dashboard Page
// ============================================================================

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSSE } from "../hooks/useSSE";
import { SystemMetrics } from "../components/MetricsGraph";
import {
  DashboardHeader,
  StatsGrid,
  SecondaryStatsGrid,
  ConnectionStatus,
  ConsumerHealth,
} from "../components/dashboard";
import EmptyState from "../components/ui/EmptyState";
import {
  DashboardStats,
  AccountInfo,
  ConnectionStatus as ConnectionStatusType,
} from "../types/nats";
import { Database } from "lucide-react";

export default function Dashboard() {
  const { connected: sseConnected } = useSSE("dashboard");

  // Fetch dashboard stats
  const { data: stats, refetch } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: () =>
      axios.get<DashboardStats>("/api/dashboard/stats").then((res) => res.data),
    refetchInterval: sseConnected ? false : 5000,
  });

  // Fetch account info
  const { data: accountInfo } = useQuery({
    queryKey: ["accountInfo"],
    queryFn: () =>
      axios.get<AccountInfo>("/api/account/info").then((res) => res.data),
    refetchInterval: sseConnected ? false : 5000,
  });

  // Fetch connections
  const { data: connections } = useQuery({
    queryKey: ["connections"],
    queryFn: () =>
      axios
        .get<ConnectionStatusType[]>("/api/connections")
        .then((res) => res.data),
    refetchInterval: sseConnected ? false : 10000,
  });

  // Fetch consumers
  const { data: consumers } = useQuery({
    queryKey: ["consumers"],
    queryFn: () => axios.get("/api/consumers").then((res) => res.data),
    refetchInterval: sseConnected ? false : 5000,
  });

  // Default values
  const dashboardStats = stats || {
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
    api: { total: 0, errors: 0 },
  };

  const hasData = consumers && consumers.length > 0;

  return (
    <div className="p-4 md:p-8">
      <DashboardHeader
        sseConnected={sseConnected}
        onRefresh={() => refetch()}
      />

      <StatsGrid stats={dashboardStats} />

      {/* Real-time Metrics Graphs */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Real-time Metrics</h2>
        <SystemMetrics />
      </div>

      <SecondaryStatsGrid account={account} />

      <ConnectionStatus
        connected={dashboardStats.server_status === "connected"}
        connections={connections || []}
      />

      {hasData ? (
        <ConsumerHealth consumers={consumers} />
      ) : (
        <EmptyState
          icon={Database}
          title="No Data Available"
          description="Connect to a NATS server with JetStream enabled to see data."
        />
      )}
    </div>
  );
}
