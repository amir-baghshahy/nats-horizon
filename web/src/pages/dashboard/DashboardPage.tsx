import { UseDashboardReturn } from './hooks/useDashboard'
import { SystemMetrics } from '../../components/MetricsGraph'
import {
  DashboardHeader, StatsGrid, SecondaryStatsGrid,
  ConnectionStatus, ConsumerHealth
} from '../../components/dashboard'
import EmptyState from '../../components/ui/EmptyState'
import { PageLoading, PageError } from '../../components/ui/PageState'
import { Database } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function DashboardPage({
  sseConnected,
  stats,
  accountInfo,
  connections,
  consumers,
  isLoading,
  isError,
  refetch,
}: UseDashboardReturn) {
  const hasData = consumers && consumers.length > 0
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
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
      <div className="p-4 md:p-6">
        <DashboardHeader
          sseConnected={sseConnected}
          onRefresh={() => refetch()}
        />
        <PageError message={t('dashboard.errorMessage')} onRetry={refetch} />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <DashboardHeader
        sseConnected={sseConnected}
        onRefresh={() => refetch()}
      />

      {/* Primary Stats Section */}
      <section className="mb-6 animate-slide-up">
        <StatsGrid stats={stats} />
      </section>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-dark-border/50 to-transparent mb-6" />

      {/* Real-time Metrics Section */}
      <section className="mb-6 animate-slide-up animate-delay-100">
        <h2 className="text-sm font-semibold mb-3 text-dark-text">{t('dashboard.realTimeMetrics')}</h2>
        <SystemMetrics />
      </section>

      {/* Secondary Stats Section */}
      <section className="mb-6 animate-slide-up animate-delay-200">
        <SecondaryStatsGrid account={accountInfo} />
      </section>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-dark-border/50 to-transparent mb-6" />

      {/* Connection & Consumer Health Section */}
      <section className="space-y-4 animate-slide-up animate-delay-300">
        <ConnectionStatus
          connected={stats.server_status === 'connected'}
          connections={connections?.connections || []}
        />

        {hasData ? (
          <ConsumerHealth consumers={consumers} />
        ) : (
          <EmptyState
            icon={Database}
            title={t('common.noData')}
            description={t('dashboard.noDataDescription')}
          />
        )}
      </section>
    </div>
  )
}
