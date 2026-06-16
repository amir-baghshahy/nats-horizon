import { Database, Users, MessageSquare, Activity } from "lucide-react";
import StatCard from "../ui/StatCard";
import { DashboardStats } from "../../types/nats";

interface StatsGridProps {
  /**
   * Dashboard statistics
   */
  stats: DashboardStats;
}

/**
 * Primary statistics grid for dashboard
 */
export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        icon={Database}
        value={stats.streams}
        label="Streams"
        iconBg="bg-primary-500/20"
        iconColor="text-primary-400"
      />

      <StatCard
        icon={Users}
        value={stats.consumers}
        label="Consumers"
        iconBg="bg-blue-500/20"
        iconColor="text-blue-400"
      />

      <StatCard
        icon={MessageSquare}
        value={stats.messages}
        label="Total Messages"
        iconBg="bg-green-500/20"
        iconColor="text-green-400"
      />

      <StatCard
        icon={Activity}
        value={stats.connections}
        label="Connections"
        iconBg="bg-cyan-500/20"
        iconColor="text-cyan-400"
      />
    </div>
  );
}
