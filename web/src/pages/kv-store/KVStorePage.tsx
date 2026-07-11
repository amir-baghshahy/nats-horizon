import {
  Clock, Database, Edit, FolderOpen, History, Key, Plus, RefreshCw, Search, Trash2, X, Eye,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";
import type { KVBucketInfo, KVKeyEntry, KVKeyHistoryEntry } from "../../types";
import { useKVStore } from "./hooks/useKVStore";
import { PageError, PageLoading } from "../../components/ui/PageState";
import { ModalWrapper, PageHeader, PanelCard, EmptyState } from "../../components/ui";
import { Button } from "../../components/ui";
import { formatBytes } from "../../utils/formatters";

function formatTimestamp(timestamp: string | number | undefined) {
  return timestamp ? new Date(timestamp).toLocaleString() : "N/A";
}

export default function KVStorePage() {
  const { t } = useTranslation();
  const store = useKVStore();

  if (store.bucketsLoading || (store.selectedBucket && store.keysLoading)) {
    return <PageLoading text={t('kvStore.loading')} />;
  }

  if (store.bucketsError || store.keysError) {
    return <PageError message={(store.bucketsError || store.keysError) instanceof Error ? (store.bucketsError as Error).message : t('kvStore.unableToLoad')} onRetry={store.refetchBuckets} />;
  }

  if (store.selectedBucket && store.historyError) {
    return <PageError message={store.historyError instanceof Error ? (store.historyError as Error).message : t('kvStore.unableToLoadHistory')} onRetry={store.refetchBuckets} />;
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 md:h-full md:overflow-hidden">
      <div className="shrink-0">
      <PageHeader
        title={t('kvStore.title')}
        subtitle={t('kvStore.subtitle')}
        actions={
          <Button variant="primary" icon={<Plus className="icon-base" />} onClick={() => store.setShowCreateModal(true)}>
            {t('kvStore.newBucket')}
          </Button>
        }
      />
      </div>

      <div className="flex-1 min-h-0 grid lg:grid-cols-3 gap-4">
        {/* Bucket list */}
        <div className="lg:col-span-1 min-h-0">
          <PanelCard
            className="h-full min-h-0"
            header={
              <div className="flex items-center justify-between">
                <h2 className="font-semibold flex items-center gap-2">
                  <Database className="icon-md text-primary-400" />
                  {t('kvStore.buckets', { count: store.buckets?.length || 0 })}
                </h2>
                <button type="button" onClick={() => store.refetchBuckets()} className="p-1.5 hover:bg-surface-primary rounded-lg" title={t('common.refresh')}>
                  <RefreshCw className="icon-base" />
                </button>
              </div>
            }
          >
            <div className="space-y-1">
              {store.buckets?.map((bucket: KVBucketInfo) => {
                const bucketId = bucket.name ?? bucket.bucket_name ?? "";
                const isSelected = store.selectedBucket === (bucket.name ?? bucket.bucket_name);
                return (
                  <div
                    key={bucket.name}
                    className={`flex items-center gap-2 rounded-lg transition-colors ${
                      isSelected
                        ? "bg-primary-500/20 ring-1 ring-primary-500/40"
                        : "hover:bg-surface-primary/60"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => store.setSelectedBucket(bucketId)}
                      className="flex flex-1 items-center gap-2.5 px-3 py-2.5 text-left min-w-0"
                    >
                      <FolderOpen className="icon-base text-purple-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-display-sm font-medium truncate">{bucket.bucket_name}</p>
                        <p className="text-display-xs text-content-tertiary">
                          {t('kvStore.keysCount', { keys: bucket.values?.toLocaleString() || 0, bytes: formatBytes(bucket.bytes || 0) })}
                        </p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={async (e) => { e.stopPropagation(); await store.handleDeleteBucket(bucketId); }}
                      className="mr-2 p-1.5 hover:bg-red-500/20 rounded-lg shrink-0"
                      title={t('kvStore.delete')}
                    >
                      <Trash2 className="icon-sm text-red-400" />
                    </button>
                  </div>
                );
              })}
              {(!store.buckets || store.buckets.length === 0) && (
                <div className="text-center py-8 text-content-tertiary">
                  <Database className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-display-sm">{t('kvStore.noBucketsFound')}</p>
                  <button
                    type="button"
                    onClick={() => store.setShowCreateModal(true)}
                    className="text-primary-400 hover:underline text-display-xs mt-1"
                  >
                    {t('kvStore.createFirstBucket')}
                  </button>
                </div>
              )}
            </div>
          </PanelCard>
        </div>

        {/* Keys panel */}
        {store.selectedBucket && (
          <div className="lg:col-span-2 min-h-0">
            <PanelCard
              className="h-full min-h-0"
              header={
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="font-semibold flex items-center gap-2">
                      <Key className="icon-base text-primary-400" />
                      {t('kvStore.keys', { count: store.filteredKeys.length })}
                    </h2>
                    <p className="text-display-xs text-content-tertiary truncate">
                      {store.buckets?.find((b: KVBucketInfo) => b.name === store.selectedBucket)?.bucket_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button type="button" variant="secondary" icon={<RefreshCw className="icon-sm" />} size="sm" onClick={() => store.handlePurgeBucket()}>
                      {t('streams.purge')}
                    </Button>
                    <Button type="button" variant="primary" icon={<Plus className="icon-sm" />} size="sm" onClick={() => { store.setModalMode("create"); store.setShowKeyModal(true); }}>
                      {t('kvStore.addKey')}
                    </Button>
                  </div>
                </div>
              }
            >
              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 icon-base text-content-tertiary" />
                <input
                  type="text"
                  aria-label={t('kvStore.searchKeys')}
                  placeholder={t('kvStore.searchKeys')}
                  value={store.searchQuery}
                  onChange={(e) => store.setSearchQuery(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>

              {/* Key list — scrolls together with the search box inside PanelCard's own scroll area */}
              <div className="space-y-1.5">
                {store.filteredKeys.map((kv: KVKeyEntry) => (
                  <div key={kv.key ?? kv.revision} className="rounded-lg bg-surface-primary/50 px-3 py-2.5 hover:bg-surface-primary/70 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Key className="icon-sm text-primary-400 shrink-0" />
                          <span className="font-mono text-display-sm font-medium truncate">{kv.key ?? "unknown-key"}</span>
                          <span className="text-display-xs text-content-tertiary shrink-0">v{kv.revision ?? 0}</span>
                        </div>
                        <div className="text-display-xs text-content-tertiary truncate max-h-10 overflow-hidden">{kv.value ?? ""}</div>
                        <div className="flex items-center gap-1.5 mt-1 text-display-xs text-content-tertiary">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(kv.created)}
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button type="button" onClick={() => store.handleGetKey(kv.key ?? "")} className="p-1.5 hover:bg-border-default rounded-lg" title={t('kvStore.getKey')}>
                          <Eye className="icon-sm" />
                        </button>
                        <button type="button" onClick={() => { store.setSelectedKey(kv.key ?? ""); store.setModalMode("edit"); store.setShowKeyModal(true); }} className="p-1.5 hover:bg-border-default rounded-lg" title={t('kvStore.edit')}>
                          <Edit className="icon-sm" />
                        </button>
                        <button type="button" onClick={() => { store.setSelectedKey(kv.key ?? ""); store.setShowHistoryModal(true); }} className="p-1.5 hover:bg-border-default rounded-lg" title={t('kvStore.history')}>
                          <History className="icon-sm" />
                        </button>
                        <button type="button" onClick={() => store.handleDeleteKey(kv.key ?? "")} className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg" title={t('kvStore.delete')}>
                          <Trash2 className="icon-sm" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {store.filteredKeys.length === 0 && (
                  <div className="text-center py-8 text-content-tertiary">
                    <Key className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-display-sm">{store.searchQuery ? t('kvStore.noKeysMatch') : t('kvStore.noKeysInBucket')}</p>
                  </div>
                )}
              </div>
            </PanelCard>
          </div>
        )}

        {!store.selectedBucket && (
          <div className="lg:col-span-2">
            <EmptyState
              icon={FolderOpen}
              title={t('kvStore.selectBucket')}
              description={t('kvStore.selectBucketDescription')}
            />
          </div>
        )}
      </div>

      {/* Create Bucket Modal */}
      {store.showCreateModal && createPortal(
        <ModalWrapper isOpen={true} onClose={() => store.setShowCreateModal(false)}>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={(e) => { if (e.target === e.currentTarget) store.setShowCreateModal(false); }}
          >
            <div className="card max-w-md w-full" role="dialog" aria-modal="true" aria-labelledby="create-bucket-title">
              <div className="flex items-center justify-between mb-4">
                <h2 id="create-bucket-title" className="text-display-sm font-bold">{t('kvStore.createBucket')}</h2>
                <button type="button" onClick={() => store.setShowCreateModal(false)} className="p-1.5 hover:bg-surface-primary rounded-lg">
                  <X className="icon-base" />
                </button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); store.handleCreateBucket({ name: fd.get("name"), history: parseInt(fd.get("history") as string) || 1, storage: "file", max_bytes: parseInt(fd.get("max_bytes") as string) || 0, compression: fd.get("compression") === "true" }); }} className="space-y-3">
                <div>
                  <label className="block text-display-xs font-medium mb-1.5" htmlFor="bucket-name">{t('kvStore.bucketName')}</label>
                  <input id="bucket-name" type="text" name="name" placeholder={t('kvStore.bucketNamePlaceholder')} className="input w-full" required autoFocus />
                </div>
                <div>
                  <label className="block text-display-xs font-medium mb-1.5" htmlFor="bucket-history">{t('kvStore.historyRevisions')}</label>
                  <input id="bucket-history" type="number" name="history" defaultValue={1} min={1} max={10} className="input w-full" />
                </div>
                <div>
                  <label className="block text-display-xs font-medium mb-1.5" htmlFor="bucket-max-bytes">{t('kvStore.maxBytes')}</label>
                  <input id="bucket-max-bytes" type="number" name="max_bytes" placeholder={t('kvStore.maxBytesPlaceholder')} className="input w-full" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="compression" value="true" id="compression" />
                  <label htmlFor="compression" className="text-display-sm">{t('kvStore.enableCompression')}</label>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Button type="button" variant="secondary" onClick={() => store.setShowCreateModal(false)}>{t('common.cancel')}</Button>
                  <Button type="submit" variant="primary">{t('kvStore.createBucket')}</Button>
                </div>
              </form>
            </div>
          </div>
        </ModalWrapper>,
        document.body
      )}

      {/* Key Create/Edit Modal */}
      {store.showKeyModal && createPortal(
        <ModalWrapper isOpen={true} onClose={() => store.setShowKeyModal(false)}>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={(e) => { if (e.target === e.currentTarget) store.setShowKeyModal(false); }}
          >
            <div className="card max-w-lg w-full" role="dialog" aria-modal="true" aria-labelledby="key-modal-title">
              <div className="flex items-center justify-between mb-4">
                <h2 id="key-modal-title" className="text-display-sm font-bold">
                  {store.modalMode === "create" ? t('kvStore.addKey') : t('kvStore.editKey')}
                </h2>
                <button type="button" onClick={() => store.setShowKeyModal(false)} className="p-1.5 hover:bg-surface-primary rounded-lg">
                  <X className="icon-base" />
                </button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); store.handlePutKey({ key: fd.get("key") as string, value: fd.get("value") as string }); }} className="space-y-3">
                <div>
                  <label className="block text-display-xs font-medium mb-1.5" htmlFor="kv-key">{t('kvStore.key')}</label>
                  <input id="kv-key" type="text" name="key" defaultValue={store.selectedKey || ""} placeholder={t('kvStore.keyPlaceholder')} className="input w-full font-mono" disabled={store.modalMode === "edit"} required autoFocus={store.modalMode === "create"} />
                </div>
                <div>
                  <label className="block text-display-xs font-medium mb-1.5" htmlFor="kv-value">{t('kvStore.value')}</label>
                  <textarea id="kv-value" name="value" placeholder={t('kvStore.valuePlaceholder')} rows={6} className="input w-full font-mono" required />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Button type="button" variant="secondary" onClick={() => store.setShowKeyModal(false)}>{t('common.cancel')}</Button>
                  <Button type="submit" variant="primary">
                    {store.modalMode === "create" ? t('kvStore.add') : t('kvStore.update')} {t('kvStore.key')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </ModalWrapper>,
        document.body
      )}

      {/* Key Detail Modal */}
      {store.selectedKeyResult && createPortal(
        <ModalWrapper isOpen={true} onClose={() => store.setSelectedKeyResult(null)}>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={(e) => { if (e.target === e.currentTarget) store.setSelectedKeyResult(null); }}
          >
            <div className="card max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col" role="dialog" aria-modal="true" aria-labelledby="key-detail-title">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 id="key-detail-title" className="text-display-sm font-bold">{t('kvStore.keyDetail')}</h2>
                  <p className="text-display-xs text-content-tertiary font-mono">{store.selectedKeyResult.key || store.selectedKey || "unknown-key"}</p>
                </div>
                <button type="button" onClick={() => store.setSelectedKeyResult(null)} className="p-1.5 hover:bg-surface-primary rounded-lg">
                  <X className="icon-base" />
                </button>
              </div>
              <div className="space-y-3 overflow-y-auto">
                <div className="grid grid-cols-2 gap-3 text-display-sm">
                  <div className="rounded-lg bg-surface-primary p-3"><p className="text-display-xs text-content-tertiary">{t('kvStore.revision')}</p><p className="font-mono">{store.selectedKeyResult.revision ?? "N/A"}</p></div>
                  <div className="rounded-lg bg-surface-primary p-3"><p className="text-display-xs text-content-tertiary">{t('streams.created')}</p><p className="font-mono">{formatTimestamp(store.selectedKeyResult.created)}</p></div>
                </div>
                <div>
                  <p className="mb-2 text-display-sm font-medium">{t('kvStore.value')}</p>
                  <pre className="max-h-80 overflow-auto rounded-lg bg-surface-primary p-3 text-display-sm"><code className="text-green-400">{store.selectedKeyResult.value ?? ""}</code></pre>
                </div>
              </div>
            </div>
          </div>
        </ModalWrapper>,
        document.body
      )}

      {/* Key History Modal */}
      {store.showHistoryModal && store.selectedKey && createPortal(
        <ModalWrapper isOpen={true} onClose={() => store.setShowHistoryModal(false)}>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={(e) => { if (e.target === e.currentTarget) store.setShowHistoryModal(false); }}
          >
            <div className="card max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col" role="dialog" aria-modal="true" aria-labelledby="history-modal-title">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 id="history-modal-title" className="text-display-sm font-bold">{t('kvStore.keyHistory')}</h2>
                  <p className="text-display-xs text-content-tertiary font-mono">{store.selectedKey}</p>
                </div>
                <button type="button" onClick={() => store.setShowHistoryModal(false)} className="p-1.5 hover:bg-surface-primary rounded-lg">
                  <X className="icon-base" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin">
                {store.history?.map((entry: KVKeyHistoryEntry) => (
                  <div key={entry.key ?? entry.revision} className="p-3 bg-surface-primary rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-display-xs font-mono px-2 py-0.5 bg-primary-500/20 text-primary-400 rounded">{entry.operation}</span>
                      <span className="text-display-xs text-content-tertiary">v{entry.revision}</span>
                      <Clock className="w-3 h-3 text-content-tertiary" />
                      <span className="text-display-xs text-content-tertiary">{formatTimestamp(entry.created)}</span>
                    </div>
                    <pre className="text-display-sm p-3 bg-surface-primary/50 rounded overflow-x-auto"><code className="text-green-400">{entry.value ?? ""}</code></pre>
                  </div>
                ))}
                {(!store.history || store.history.length === 0) && (
                  <div className="text-center py-8 text-content-tertiary">
                    <History className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-display-sm">{t('kvStore.noHistory')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ModalWrapper>,
        document.body
      )}
    </div>
  );
}
