import { UseConnectionsReturn } from './hooks/useConnections'
import {
  RefreshCw, XCircle, Server, Users, Network, Activity,
  ChevronDown, ChevronRight, Cable, Download, Upload, Clock, Gauge, Hash
} from 'lucide-react'
import ConnectionFilters from '../../components/connections/ConnectionFilters'
import { HealthService } from '../../types'
import type { ConnectionInfo } from '../../types'
import { useTranslation } from 'react-i18next'
import { StatCard, DataList, PageHeader, PanelCard } from '../../components/ui'
import { Button } from '../../components/ui';
import { formatBytes, formatNumber } from '../../utils/formatters'

export default function ConnectionsPage({
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
}: UseConnectionsReturn) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 md:h-full md:overflow-hidden">
      <div className="shrink-0">
      <PageHeader
        title={t('connections.title')}
        subtitle={t('connections.subtitle')}
        actions={
          <Button variant="secondary" size="sm" icon={<RefreshCw className="icon-sm" />} onClick={() => refetch()}>
            {t('common.refresh')}
          </Button>
        }
      />
      </div>

      <div className="shrink-0 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          icon={Network}
          value={stats.total}
          label={t('connections.title')}
        />
        <StatCard
          icon={Users}
          value={stats.uniqueUsers}
          label={t('connections.uniqueUsers')}
          iconBg="bg-blue-500/20"
          iconColor="text-blue-400"
        />
        <StatCard
          icon={Activity}
          value={stats.totalSubs}
          label={t('connections.subscriptions')}
          iconBg="bg-green-500/20"
          iconColor="text-green-400"
        />
        <StatCard
          icon={Server}
          value={Math.floor(stats.avgSubs)}
          label={t('connections.avgSubsPerConn')}
          iconBg="bg-orange-500/20"
          iconColor="text-orange-400"
        />
        <StatCard
          icon={Download}
          value={formatBytes(stats.totalDataIn)}
          label={t('connections.dataIn')}
          formatValue={false}
          iconBg="bg-cyan-500/20"
          iconColor="text-cyan-400"
          sub={t('connections.msgsCount', { count: formatNumber(stats.totalMsgsIn) })}
        />
        <StatCard
          icon={Upload}
          value={formatBytes(stats.totalDataOut)}
          label={t('connections.dataOut')}
          formatValue={false}
          iconBg="bg-violet-500/20"
          iconColor="text-violet-400"
          sub={t('connections.msgsCount', { count: formatNumber(stats.totalMsgsOut) })}
        />
      </div>

      <div className="shrink-0">
        <PanelCard
          title={t('connections.serverDistribution')}
          footer={
            <span className="rounded-full bg-primary-500/10 px-3 py-1 text-display-sm text-primary-300">
              {t('connections.total', { count: filteredConnections.length })}
            </span>
          }
        >

          {serverData.length > 0 ? (
            <div className="space-y-4">
              {serverData.map((server: any) => {
                const percentage =
                  filteredConnections.length > 0
                    ? Math.round((server.connections / filteredConnections.length) * 100)
                    : 0

                return (
                  <div key={server.server} className="space-y-2">
                    <div className="flex items-center justify-between gap-4 text-display-sm">
                      <span className="truncate font-medium">{server.server}</span>
                      <span className="text-content-tertiary">
                        {server.connections} · {percentage}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-primary">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary-500 to-violet-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border-default bg-surface-primary/30 p-6 text-center text-content-tertiary">
              <Network className="mx-auto mb-3 h-10 w-10 opacity-50" />
              <p>{t('connections.noServerData')}</p>
            </div>
          )}
        </PanelCard>
      </div>

      <div className="shrink-0">
      <ConnectionFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterServer={filterServer}
        setFilterServer={setFilterServer}
        servers={servers}
      />
      </div>

      <DataList
        fill
        items={filteredConnections}
        isLoading={isLoading}
        isEmpty={filteredConnections.length === 0}
        emptyIcon={Cable}
        emptyTitle={t('connections.noConnectionsFound')}
        emptyDescription={t('connections.searchPlaceholder')}
        getKey={(conn) => String(conn.cid)}
        footer={
          <span>
            {t('connections.showingConnections', { filtered: filteredConnections.length, total: connections.length })}
          </span>
        }
        renderItem={(conn: ConnectionInfo) => {
          const cid = conn.cid ?? 0
          const isExpanded = expandedConnections.has(cid)

          return (
            <div
              key={cid}
              className="border-l-2 border-l-transparent hover:border-l-primary-500 transition-colors"
            >
              <div className="p-4 hover:bg-surface-primary/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-status-success animate-pulse" />

                  <button
                    onClick={() => toggleExpand(cid)}
                    className="p-1 hover:bg-surface-primary rounded transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="icon-base text-content-tertiary" />
                    ) : (
                      <ChevronRight className="icon-base text-content-tertiary" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">
                        {conn.user || conn.name || t('connections.anonymous')}
                      </span>
                      {conn.cid != null && (
                        <span className="rounded px-1.5 py-0.5 text-display-xs font-mono bg-primary-500/10 text-primary-400 shrink-0">
                          #{conn.cid}
                        </span>
                      )}
                      {conn.type && (
                        <span className="hidden sm:inline rounded px-1.5 py-0.5 text-display-xs bg-surface-primary text-content-tertiary shrink-0">
                          {conn.type}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-display-xs text-content-tertiary">
                      <span className="font-mono">
                        {conn.ip}{conn.port ? `:${conn.port}` : ''}
                      </span>
                      <span className="flex items-center gap-1 min-w-0">
                        <Server className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[200px]" title={conn.server}>{conn.server}</span>
                      </span>
                    </div>
                  </div>

                  <div className="hidden lg:flex items-center gap-4 text-display-sm">
                    <div className="text-center min-w-[52px]">
                      <p className="font-medium tabular-nums">{formatNumber(conn.subs_count || 0)}</p>
                      <p className="text-display-xs text-content-tertiary">{t('connections.subs')}</p>
                    </div>
                    <div className="text-center min-w-[64px]">
                      <p className="font-medium tabular-nums flex items-center justify-center gap-1">
                        <Download className="h-3 w-3 text-cyan-400" />{formatNumber(conn.in_msgs || 0)}
                      </p>
                      <p className="text-display-xs text-content-tertiary">{t('connections.inMsgs')}</p>
                    </div>
                    <div className="text-center min-w-[64px]">
                      <p className="font-medium tabular-nums flex items-center justify-center gap-1">
                        <Upload className="h-3 w-3 text-violet-400" />{formatNumber(conn.out_msgs || 0)}
                      </p>
                      <p className="text-display-xs text-content-tertiary">{t('connections.outMsgs')}</p>
                    </div>
                    <div className="text-center min-w-[56px]">
                      <p className="font-medium tabular-nums">{conn.rtt || '—'}</p>
                      <p className="text-display-xs text-content-tertiary">{t('connections.rtt')}</p>
                    </div>
                    <div className="text-center min-w-[64px]">
                      <p className="font-medium tabular-nums">
                        {getConnectionDuration(conn.connected_at || '')}
                      </p>
                      <p className="text-display-xs text-content-tertiary">{t('connections.duration')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        const ok = await confirm({
                          title: t('connections.terminateConnection'),
                          message: t('connections.terminateConfirm', { cid: String(conn.cid) }),
                          confirmLabel: t('connections.terminate'),
                          variant: "danger"
                        })
                        if (ok) {
                          HealthService.deleteConnections(
                            String(conn.cid || ''),
                          )
                            .then(() => refetch())
                            .catch(() =>
                              toast(
                                'error',
                                t('connections.terminateFailed'),
                              ),
                            )
                        }
                      }}
                      className="p-2 hover:bg-surface-primary rounded-lg transition-colors text-status-error"
                      title={t('connections.terminateConnection')}
                    >
                      <XCircle className="icon-base" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 md:pl-8">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      <DetailItem icon={Download} label={t('connections.inMsgs')} value={formatNumber(conn.in_msgs || 0)} />
                      <DetailItem icon={Upload} label={t('connections.outMsgs')} value={formatNumber(conn.out_msgs || 0)} />
                      <DetailItem icon={Download} label={t('connections.inBytes')} value={formatBytes(conn.in_bytes || 0)} />
                      <DetailItem icon={Upload} label={t('connections.outBytes')} value={formatBytes(conn.out_bytes || 0)} />
                      <DetailItem icon={Activity} label={t('connections.subs')} value={formatNumber(conn.subs_count || 0)} />
                      <DetailItem icon={Gauge} label={t('connections.pending')} value={formatBytes(conn.pending_bytes || 0)} />
                      <DetailItem icon={Gauge} label={t('connections.rtt')} value={conn.rtt || t('dashboard.na')} />
                      <DetailItem icon={Hash} label={t('connections.cid')} value={conn.cid != null ? `#${conn.cid}` : t('dashboard.na')} />
                      <DetailItem icon={Clock} label={t('connections.connectedSince')} value={conn.connected_at ? new Date(conn.connected_at).toLocaleString() : t('dashboard.na')} />
                      <DetailItem icon={Clock} label={t('connections.lastActivity')} value={conn.last_activity ? new Date(conn.last_activity).toLocaleString() : t('dashboard.na')} />
                      <DetailItem icon={Server} label={t('connections.serverId')} value={conn.server_id || t('dashboard.na')} mono />
                      {conn.name && <DetailItem icon={Cable} label={t('connections.clientName')} value={conn.name} mono />}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        }}
      />
    </div>
  )
}

function DetailItem({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: typeof Server
  label: string
  value: React.ReactNode
  mono?: boolean
}) {
  return (
    <div className="bg-surface-primary/50 rounded-lg p-3 min-w-0">
      <p className="flex items-center gap-1.5 text-display-xs text-content-tertiary">
        <Icon className="h-3 w-3 shrink-0" />
        <span className="truncate">{label}</span>
      </p>
      <p className={`font-medium text-display-sm mt-1 truncate tabular-nums ${mono ? 'font-mono' : ''}`} title={typeof value === 'string' ? value : undefined}>
        {value}
      </p>
    </div>
  )
}
