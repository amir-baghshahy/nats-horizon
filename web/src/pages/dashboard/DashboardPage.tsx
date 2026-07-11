import { UseDashboardReturn } from './hooks/useDashboard'
import { SystemMetrics } from '../../components/MetricsGraph'
import {
  DashboardHeader, StatsGrid, SecondaryStatsGrid,
  ConnectionStatus, ConsumerHealth, ClusterHealthCard
} from '../../components/dashboard'
import { PageLoading, PageError } from '../../components/ui/PageState'
import { Database } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function DashboardPage({
  sseConnected,
  stats,
  accountInfo,
  connections,
  consumers,
  clusterHealth,
  isLoading,
  isError,
  refetch,
}: UseDashboardReturn) {
  const hasData = consumers && consumers.length > 0
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="h-full flex flex-col p-4 md:p-6">
        <DashboardHeader
          sseConnected={sseConnected}
          onRefresh={() => refetch()}
        />
        <PageLoading text={t('dashboard.loadingMessage')} />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="h-full flex flex-col p-4 md:p-6">
        <DashboardHeader
          sseConnected={sseConnected}
          onRefresh={() => refetch()}
        />
        <PageError message={t('dashboard.errorMessage')} onRetry={refetch} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 animate-fade-in md:h-full md:overflow-hidden">
      <div className="shrink-0">
        <DashboardHeader
          sseConnected={sseConnected}
          onRefresh={() => refetch()}
        />
      </div>

      {/* Primary Stats Section */}
      <section className="shrink-0 animate-slide-up">
        <StatsGrid stats={stats} limits={accountInfo?.limits} />
      </section>

      {/* Secondary Stats Section */}
      <section className="shrink-0 animate-slide-up animate-delay-100">
        <SecondaryStatsGrid account={accountInfo} />
      </section>

      {/* Real-time Metrics Section */}
      <section className="shrink-0 animate-slide-up animate-delay-200">
        <h2 className="text-display-sm font-semibold mb-2 text-content-primary">{t('dashboard.realTimeMetrics')}</h2>
        <SystemMetrics />
      </section>

      {/* Cluster / Connection / Consumer Health — stretches to the bottom of the viewport */}
      <section className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-5 gap-4 animate-slide-up animate-delay-300">
        <div className="lg:col-span-3 flex flex-col min-h-0 gap-3">
          <div className="shrink-0">
            <ClusterHealthCard health={clusterHealth} />
          </div>
          <div className="flex-1 min-h-0">
            <ConnectionStatus
              connected={stats.server_status === 'connected'}
              connections={connections?.connections || []}
            />
          </div>
        </div>

        <div className="lg:col-span-2 min-h-0">
          {hasData ? (
            <ConsumerHealth consumers={consumers} />
          ) : (
            <div className="card h-full flex flex-col items-center justify-center text-center p-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-primary/50 text-content-tertiary">
                <Database className="h-16 w-16" />
              </div>
              <h3 className="text-display-lg font-semibold text-content-primary">{t('common.noData')}</h3>
              <p className="mt-2 text-display-sm leading-6 text-content-secondary">{t('dashboard.noDataDescription')}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
