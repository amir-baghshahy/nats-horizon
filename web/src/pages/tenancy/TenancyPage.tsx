import type { ConnectionConfig, ConnectionStatus } from '../../types'
import { UseTenancyReturn } from './hooks/useTenancy'
import { useTranslation } from "react-i18next";
import {
  Server, Plus, Edit, Trash2, CheckCircle, XCircle,
  RefreshCw, Play, Globe, Star
} from 'lucide-react'
import { PageError, PageLoading } from '../../components/ui/PageState'

export default function TenancyPage({
  showModal,
  setShowModal,
  editingConnection,
  setEditingConnection,
  testingUrl,
  testResult,
  setTestResult,
  connectionsLoading,
  statusesLoading,
  connectionsError,
  statusesError,
  connections,
  statuses,
  deleteMutation,
  setDefaultMutation,
  testConnectionMutation,
  getErrorMessage,
  refetchConnections,
  getStatusForConnection,
  handleTest,
  handleSubmit,
  formatDate,
  confirm,
}: UseTenancyReturn) {
  const { t } = useTranslation();
  if (connectionsLoading || statusesLoading) {
    return <PageLoading text={t('tenancy.loading')} />
  }

  if (connectionsError || statusesError) {
    return (
      <PageError
        message={getErrorMessage(connectionsError || statusesError)}
        onRetry={refetchConnections}
      />
    )
  }

  const stats = {
    total: connections?.connections?.length || 0,
    active: Array.isArray(statuses)
      ? statuses.filter((s: ConnectionStatus) => s.connected)?.length || 0
      : 0,
    healthy: Array.isArray(statuses)
      ? statuses.filter((s: ConnectionStatus) => s.healthy)?.length || 0
      : 0,
    default:
      connections?.connections?.find((c: ConnectionConfig) => c.is_default)?.name || t('common.none'),
  }

  return (
    <div className="p-3 md:p-4 lg:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        <div>
          <h1 className="text-xl md:text-xl font-bold flex items-center gap-3">
            <Globe className="w-8 h-8 text-primary-400" />
            {t('tenancy.title')}
          </h1>
          <p className="text-dark-muted mt-1">
            {t('tenancy.subtitle')}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingConnection(null)
            setShowModal(true)
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('tenancy.addConnection')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <Server className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="text-xl font-bold">{stats.total}</p>
              <p className="text-xs text-dark-muted">{t('tenancy.totalServers')}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-xl font-bold">{stats.active}</p>
              <p className="text-xs text-dark-muted">{t('tenancy.connected')}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Play className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xl font-bold">{stats.healthy}</p>
              <p className="text-xs text-dark-muted">{t('tenancy.healthy')}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium truncate">{stats.default}</p>
              <p className="text-xs text-dark-muted">{t('tenancy.default')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Server className="w-5 h-5" />
          {t('tenancy.serverConnections')}
        </h3>
        <div className="space-y-4">
          {connections?.connections?.map((conn: ConnectionConfig) => {
            const connectionId = conn.id ?? conn.name ?? conn.url ?? ''
            const connectionName = conn.name ?? t('tenancy.unnamedConnection')
            const connectionUrl = conn.url ?? ''
            const status = getStatusForConnection(connectionId)

            return (
              <div
                key={connectionId}
                className={`p-4 rounded-lg border transition-colors ${
                  conn.is_default
                    ? 'border-primary-500/50 bg-primary-500/5'
                    : 'border-dark-border bg-dark-bg/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{connectionName}</h4>
                      {conn.is_default && (
                        <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">
                          {t('tenancy.default')}
                        </span>
                      )}
                      {conn.enabled ? (
                        <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">
                          {t('tenancy.enabled')}
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400">
                          {t('tenancy.disabled')}
                        </span>
                      )}
                      {status?.connected ? (
                        <span className="flex items-center gap-1 text-xs text-green-400">
                          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                          {t('tenancy.connected')}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-red-400">
                          <XCircle className="w-3 h-3" />
                          {status?.error || t('tenancy.disconnected')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-dark-muted mb-2">
                      {conn.description || t('tenancy.noDescription')}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-dark-muted">
                      <span className="font-mono">{connectionUrl}</span>
                      {status?.latency && (
                        <span>{t('tenancy.latency', { value: status.latency })}</span>
                      )}
                      <span>
                        {t('tenancy.lastChecked', { time: status ? formatDate(status.last_checked) : 'N/A' })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!conn.is_default && (
                      <button
                        onClick={() => setDefaultMutation.mutate(connectionId)}
                        className="p-2 hover:bg-yellow-500/20 text-yellow-400 rounded-lg"
                        title={t('tenancy.setDefault')}
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleTest(connectionUrl)}
                      disabled={testConnectionMutation.isPending}
                      className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg"
                      title={t('tenancy.testConnection')}
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${testConnectionMutation.isPending && testingUrl === connectionUrl ? 'animate-spin' : ''}`}
                      />
                    </button>
                    <button
                      onClick={() => {
                        setEditingConnection(conn)
                        setShowModal(true)
                      }}
                      className="p-2 hover:bg-dark-border rounded-lg"
                      title={t('common.edit')}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {!conn.is_default && (
                      <button
                        onClick={async () => {
                          const ok = await confirm({ title: t('tenancy.deleteConnection'), message: t('tenancy.deleteConnectionConfirm', { name: connectionName }), confirmLabel: t('common.delete'), variant: "danger" })
                          if (ok) deleteMutation.mutate(connectionId)
                        }}
                        className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg"
                        title={t('common.delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {testResult && testingUrl === connectionUrl && (
                  <div
                    className={`mt-3 p-3 rounded-lg text-sm ${
                      testResult.healthy
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {testResult.healthy ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>
                          {t('tenancy.connectionSuccessful', { latency: testResult.latency })}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        <span>{t('tenancy.connectionFailed', { error: testResult.error })}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="card max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {editingConnection ? t('tenancy.editConnection') : t('tenancy.addConnection')}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingConnection(null)
                  setTestResult(null)
                }}
                className="p-2 hover:bg-dark-bg rounded-lg"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('tenancy.name')}</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingConnection?.name}
                  placeholder={t('tenancy.namePlaceholder')}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('tenancy.url')}</label>
                <input
                  type="text"
                  name="url"
                  defaultValue={editingConnection?.url}
                  placeholder={t('tenancy.urlPlaceholder')}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('tenancy.description')}
                </label>
                <textarea
                  name="description"
                  defaultValue={editingConnection?.description}
                  placeholder={t('tenancy.descriptionPlaceholder')}
                  className="input w-full"
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enabled"
                  name="enabled"
                  defaultChecked={editingConnection?.enabled ?? true}
                />
                <label htmlFor="enabled" className="text-sm">
                  {t('tenancy.enabled')}
                </label>
              </div>
              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingConnection(null)
                  }}
                  className="btn-secondary"
                >
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn-primary">
                  {editingConnection ? t('tenancy.update') : t('tenancy.create')} Connection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
