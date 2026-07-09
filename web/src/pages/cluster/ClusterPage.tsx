import { UseClusterReturn } from './hooks/useCluster'
import { useTranslation } from "react-i18next";
import {
  Server, HardDrive, Activity, CheckCircle, XCircle,
  RefreshCw, Copy, Database, Shield,
  Zap, Globe, Info
} from 'lucide-react'
import { PageError, PageLoading } from '../../components/ui/PageState'
import { PageHeader, PanelCard } from '../../components/ui'
import { Button } from '../../components/ui';

export default function ClusterPage({
  selectedStream,
  setSelectedStream,
  clusterInfo,
  clusterNodes,
  clusterHealth,
  streamReplicas,
  streams,
  infoLoading,
  nodesLoading,
  healthLoading,
  streamsLoading,
  replicasLoading,
  infoError,
  nodesError,
  healthError,
  streamsError,
  replicasError,
  refreshAll,
  getErrorMessage,
  refetchReplicas,
}: UseClusterReturn) {
  const { t } = useTranslation();
  if (infoLoading || nodesLoading || healthLoading || streamsLoading || (selectedStream && replicasLoading)) {
    return <PageLoading text={t('cluster.loading')} />
  }

  if (infoError || nodesError || healthError || streamsError) {
    return (
      <PageError
        message={getErrorMessage(infoError || nodesError || healthError || streamsError)}
        onRetry={refreshAll}
      />
    )
  }

  if (selectedStream && replicasError) {
    return (
      <PageError
        message={getErrorMessage(replicasError)}
        onRetry={() => refetchReplicas()}
      />
    )
  }

  return (
    <div className="p-4 md:p-6">
      <PageHeader
        title={t('cluster.title')}
        subtitle={clusterInfo?.is_clustered
          ? t('cluster.cluster', { name: clusterInfo?.cluster_name || t('cluster.notClustered') })
          : t('cluster.standaloneMode')}
        actions={
          <Button variant="secondary" size="sm" icon={<RefreshCw className="icon-sm" />} onClick={refreshAll}>
            {t('common.refresh')}
          </Button>
        }
      />

      <div className={`card mb-4 border-l-4 ${
        clusterHealth?.connected
          ? 'border-l-status-success bg-status-success/10'
          : 'border-l-status-error bg-status-error/10'
      }`}>
        <div className="flex items-center gap-3">
          {clusterHealth?.connected ? (
            <CheckCircle className="icon-md text-status-success" />
          ) : (
            <XCircle className="icon-md text-status-error" />
          )}
          <div>
            <p className="font-medium">
              {clusterHealth?.connected ? t('cluster.connected') : t('cluster.disconnected')}
            </p>
            <p className="text-display-sm text-content-tertiary">
              {clusterHealth?.connected
                ? t('cluster.server', { name: clusterHealth?.connected_server?.id || 'Current server' })
                : t('cluster.unableToConnect')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <PanelCard
          title={t('cluster.clusterInformation')}
          icon={<Server className="icon-md text-primary-400" />}
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-surface-primary/50 rounded-lg">
              <span className="text-content-tertiary">{t('cluster.clusterName')}</span>
              <span className="font-medium font-mono">
                {clusterInfo?.cluster_name || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-surface-primary/50 rounded-lg">
              <span className="text-content-tertiary">{t('cluster.serverName')}</span>
              <span className="font-medium font-mono">
                {clusterInfo?.server_name || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-surface-primary/50 rounded-lg">
              <span className="text-content-tertiary">{t('cluster.mode')}</span>
              <span className={`px-2 py-1 rounded text-display-xs ${
                clusterInfo?.is_clustered
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'bg-blue-500/20 text-blue-400'
              }`}>
                {clusterInfo?.is_clustered ? t('cluster.clustered') : t('cluster.standalone')}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-surface-primary/50 rounded-lg">
              <span className="text-content-tertiary">{t('cluster.jetStream')}</span>
              <span className={`px-2 py-1 rounded text-display-xs ${
                clusterInfo?.jetstream?.enabled
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-border-default'
              }`}>
                {clusterInfo?.jetstream?.enabled ? t('common.enabled') : t('common.disabled')}
              </span>
            </div>
            {clusterInfo?.jetstream?.domain && (
              <div className="flex justify-between items-center p-3 bg-surface-primary/50 rounded-lg">
                <span className="text-content-tertiary">{t('cluster.jsDomain')}</span>
                <span className="font-mono text-display-sm">{clusterInfo.jetstream.domain}</span>
              </div>
            )}
            {clusterInfo?.jetstream?.tier && (
              <div className="flex justify-between items-center p-3 bg-surface-primary/50 rounded-lg">
                <span className="text-content-tertiary">{t('cluster.jsTier')}</span>
                <span className="font-mono text-display-sm">{clusterInfo.jetstream.tier}</span>
              </div>
            )}
          </div>
        </PanelCard>

        <PanelCard
          title={t('cluster.systemHealth')}
          icon={<Activity className="icon-md text-primary-400" />}
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-surface-primary/50 rounded-lg">
              <span className="text-content-tertiary">{t('cluster.connectionStatus')}</span>
              <span className={`px-2 py-1 rounded text-display-xs ${
                clusterHealth?.connected
                  ? 'bg-status-success/20 text-status-success'
                  : 'bg-status-error/20 text-status-error'
              }`}>
                {clusterHealth?.status || t('cluster.disconnected')}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-surface-primary/50 rounded-lg">
              <span className="text-content-tertiary">{t('cluster.serverStatus')}</span>
              <span className="font-mono text-display-sm capitalize">
                {clusterHealth?.server_status || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-surface-primary/50 rounded-lg">
              <span className="text-content-tertiary">{t('cluster.jetStreamStatus')}</span>
              <span className={`px-2 py-1 rounded text-display-xs ${
                clusterHealth?.jetstream?.status === 'ok'
                  ? 'bg-status-success/20 text-status-success'
                  : 'bg-status-error/20 text-status-error'
              }`}>
                {clusterHealth?.jetstream?.status || t('messages.notAvailable')}
              </span>
            </div>
            {clusterHealth?.connected_server?.url && (
              <div className="flex justify-between items-center p-3 bg-surface-primary/50 rounded-lg">
                <span className="text-content-tertiary">{t('cluster.connectedUrl')}</span>
                <span className="font-mono text-display-sm truncate max-w-[200px]">
                  {clusterHealth.connected_server.url}
                </span>
              </div>
            )}
          </div>
        </PanelCard>
      </div>

      {clusterNodes?.clustered && clusterNodes.nodes.length > 0 && (
        <PanelCard
          title={t('cluster.clusterNodes', { count: clusterNodes.nodes.length })}
          icon={<HardDrive className="icon-md text-primary-400" />}
          className="mt-6"
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clusterNodes.nodes.map((node: any) => (
              <div
                key={node.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  node.current
                    ? 'border-primary-500/50 bg-primary-500/10'
                    : node.healthy
                    ? 'border-border-default bg-surface-primary/50'
                    : 'border-status-error/50 bg-status-error/10'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {node.healthy ? (
                        <CheckCircle className="icon-base text-status-success flex-shrink-0" />
                      ) : (
                        <XCircle className="icon-base text-status-error flex-shrink-0" />
                      )}
                      <span className="font-mono text-display-sm font-medium truncate">
                        {node.name}
                      </span>
                    </div>
                    {node.current && (
                      <span className="text-display-xs text-primary-400 ml-6">
                        {t('cluster.current')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-2 text-display-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-content-tertiary">{t('common.status')}</span>
                    <span className={`px-2 py-0.5 rounded text-display-xs ${
                      node.healthy
                        ? 'bg-status-success/20 text-status-success'
                        : 'bg-status-error/20 text-status-error'
                    }`}>
                      {node.healthy ? t('cluster.healthy') : t('cluster.unhealthy')}
                    </span>
                  </div>
                  {node.active ? (
                    <div className="flex items-center justify-between">
                      <span className="text-content-tertiary">{t('cluster.active')}</span>
                      {node.active ? (
                        <Zap className="icon-base text-yellow-400" />
                      ) : (
                        <span className="text-content-tertiary">{t('common.no')}</span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-content-tertiary">Active</span>
                      <span className="text-content-tertiary">No</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </PanelCard>
      )}

      {clusterInfo?.is_clustered && (
        <PanelCard
          title={t('cluster.streamReplication')}
          icon={<Database className="icon-md text-primary-400" />}
          className="mt-6"
        >
          <div className="grid lg:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-3">{t('cluster.selectStream')}</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {streams?.map((stream: any) => (
                  <div
                    key={stream.config?.name}
                    onClick={() => setSelectedStream(stream.config?.name)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedStream === stream.config?.name
                        ? 'bg-primary-500/20 border border-primary-500/50'
                        : 'bg-surface-primary hover:bg-surface-primary/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-display-sm">{stream.config?.name}</span>
                      <span className="text-display-xs text-content-tertiary">
                        {stream.config?.replicas}x {t('cluster.replicas', { count: stream.config?.replicas })}
                      </span>
                    </div>
                  </div>
                ))}

                {(!streams || streams.length === 0) && (
                  <div className="text-center py-8 text-content-tertiary">
                    <Database className="icon-lg mx-auto mb-2 opacity-50" />
                    <p>{t('cluster.noStreamsFound')}</p>
                  </div>
                )}
              </div>
            </div>

            {selectedStream && streamReplicas && (
              <div>
                <h3 className="font-medium mb-3">
                  {t('cluster.replicationDetails', { name: selectedStream })}
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-surface-primary/50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-content-tertiary">{t('common.replicas')}</span>
                      <span className="font-medium">{streamReplicas.replicas}x</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-content-tertiary">{t('cluster.clustered')}</span>
                      <span className={`px-2 py-1 rounded text-display-xs ${
                        streamReplicas.is_clustered
                          ? 'bg-status-success/20 text-status-success'
                          : 'bg-border-default'
                      }`}>
                        {streamReplicas.is_clustered ? t('common.yes') : t('common.no')}
                      </span>
                    </div>
                    {streamReplicas.cluster && (
                      <div className="mt-3 pt-3 border-t border-border-default">
                        <p className="text-display-sm text-content-tertiary mb-2">{t('cluster.clusterInfo')}</p>
                        <p className="font-mono text-display-sm">{streamReplicas.cluster.name}</p>
                      </div>
                    )}
                  </div>

                  {streamReplicas.mirror && (
                    <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Copy className="icon-base text-purple-400" />
                        <span className="font-medium">{t('cluster.mirrorSource')}</span>
                      </div>
                      <p className="font-mono text-display-sm">{streamReplicas.mirror.name}</p>
                      {streamReplicas.mirror.domain && (
                        <p className="text-display-xs text-content-tertiary mt-1">
                          {t('cluster.domain', { domain: streamReplicas.mirror.domain })}
                        </p>
                      )}
                    </div>
                  )}

                  {streamReplicas.sources && streamReplicas.sources.length > 0 && (
                    <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="icon-base text-blue-400" />
                        <span className="font-medium">{t('cluster.aggregateSources')}</span>
                      </div>
                      <div className="space-y-1">
                        {streamReplicas.sources.map((source: any, idx: any) => (
                          <p key={idx} className="font-mono text-display-sm">
                            {source.name}
                            {source.domain && <span className="text-content-tertiary ml-2">@ {source.domain}</span>}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {streamReplicas.placement && (
                    <div className="p-4 bg-surface-primary/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="icon-base text-primary-400" />
                        <span className="font-medium">{t('cluster.placementRules')}</span>
                      </div>
                      <p className="text-display-sm text-content-tertiary">
                        Cluster: <span className="font-mono">{streamReplicas.placement.cluster}</span>
                      </p>
                      {streamReplicas.placement.tags.length > 0 && (
                        <div className="mt-2">
                          <span className="text-display-sm text-content-tertiary">{t('cluster.tags')}</span>
                          {streamReplicas.placement.tags.map((tag: any, idx: any) => (
                            <span key={idx} className="inline-block px-2 py-0.5 bg-surface-primary rounded text-display-xs font-mono ml-1">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {!selectedStream && (
              <div className="flex items-center justify-center h-64 text-content-tertiary">
                <div className="text-center">
                  <Database className="icon-lg mx-auto mb-2 opacity-50" />
                  <p>{t('cluster.selectStreamPrompt')}</p>
                </div>
              </div>
            )}
          </div>
        </PanelCard>
      )}

      {(!clusterInfo?.is_clustered) && (
        <PanelCard className="mt-6">
          <div className="flex items-start gap-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
            <Info className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-400 mb-1">{t('cluster.standaloneModeTitle')}</h3>
              <p className="text-content-tertiary text-display-sm">
                {t('cluster.standaloneModeDescription')}
              </p>
            </div>
          </div>
        </PanelCard>
      )}
    </div>
  )
}

