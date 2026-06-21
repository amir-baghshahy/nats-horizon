import type { StreamStats } from "../hooks/useStreamsPage";
import { Database, HardDrive, MessageSquare, Users } from "lucide-react";

interface StreamsStatsProps {
  stats: StreamStats;
}

export default function StreamsStats({ stats }: StreamsStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      <div className="card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
            <Database className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <p className="text-xl font-bold">{stats.total}</p>
            <p className="text-xs text-dark-muted">Total Streams</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <HardDrive className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-xl font-bold">{stats.fileStorage}</p>
            <p className="text-xs text-dark-muted">File Storage</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Database className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-xl font-bold">{stats.memoryStorage}</p>
            <p className="text-xs text-dark-muted">Memory Storage</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-xl font-bold">{stats.totalMessages.toLocaleString()}</p>
            <p className="text-xs text-dark-muted">Total Messages</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <p className="text-xl font-bold">{stats.totalConsumers}</p>
            <p className="text-xs text-dark-muted">Total Consumers</p>
          </div>
        </div>
      </div>
    </div>
  );
}
