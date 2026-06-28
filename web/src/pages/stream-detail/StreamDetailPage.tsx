import { useTranslation } from "react-i18next";
import {
  Activity,
  ArrowLeft,
  Copy as CopyIcon,
  Database,
  Download,
  FileText,
  Filter,
  HardDrive,
  Loader2,
  MessageSquare,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useStreamDetail } from "./hooks/useStreamDetail";
import EditStreamModal from "./components/EditStreamModal";

function formatBytes(bytes: number) {
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + " GB";
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(2) + " KB";
  return bytes + " B";
}

export default function StreamDetailPage() {
  const { t } = useTranslation();
  const {
    name,
    stream: streamData,
    consumers,
    activeTab,
    isPaused,
    loadingAction,
    showEditModal,
    editForm,
    updatePending,
    setActiveTab,
    setIsPaused,
    setShowEditModal,
    setEditForm,
    refetch,
    handlePurgeStream,
    handleDeleteStream,
    handleEditConfig,
    handleUpdateStream,
    handleCloneStream,
    navigate,
  } = useStreamDetail();

   if (!name) return <div>{t("streams.notFound")}</div>;

  return (
    <div className="p-3 md:p-4 lg:p-6">
      <div className="flex items-center gap-4 mb-4">
        <Link to="/streams" className="p-2 hover:bg-dark-bg rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold">{name}</h1>
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                (streamData.state?.num_pending || 0) > 1000
                  ? "bg-status-warning/20 text-status-warning"
                  : "bg-status-success/20 text-status-success"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${isPaused ? "" : "animate-pulse"}`} />
               <span className="text-sm font-medium">
                 {isPaused ? t("streams.paused") : (streamData.state?.num_pending || 0) > 1000 ? t("streams.highLag") : t("streams.healthy")}
               </span>
            </div>
          </div>
          <p className="text-dark-muted mt-1">{streamData.config?.subjects?.join(", ")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsPaused(!isPaused)} className="btn-secondary flex items-center gap-2">
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <button onClick={() => refetch()} className="btn-secondary">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.open(`/api/export/streams/${encodeURIComponent(name)}`, "_blank")}
            className="btn-secondary flex items-center gap-2"
          >
             <Download className="w-4 h-4" />
             {t("streams.export")}
          </button>
           <button className="btn-primary flex items-center gap-2" onClick={() => setActiveTab("consumers")}>
             <Plus className="w-4 h-4" />
             {t("streams.addConsumer")}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{(streamData.state?.messages || 0).toLocaleString()}</p>
               <p className="text-xs text-dark-muted">{t("streams.messages")}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatBytes(streamData.state?.bytes || 0)}</p>
               <p className="text-xs text-dark-muted">{t("streams.storage")}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{streamData.state?.consumers || 0}</p>
               <p className="text-xs text-dark-muted">{t("streams.consumers")}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{(streamData.state?.num_pending || 0).toLocaleString()}</p>
              <p className="text-xs text-dark-muted">Lag</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Database className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
               <p className="text-2xl font-bold">{streamData.config?.storage === "file" ? t("streams.file") : t("streams.memory")}</p>
               <p className="text-xs text-dark-muted">{t("streams.storageType")}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{streamData.config?.replicas || 1}</p>
               <p className="text-xs text-dark-muted">{t("streams.replicas")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-4 bg-dark-bg p-1 rounded-lg w-fit">
        {[
           { id: "overview", label: t("streams.overview"), icon: Activity },
           { id: "messages", label: t("streams.messages"), icon: MessageSquare },
           { id: "consumers", label: t("streams.consumers"), icon: Users },
           { id: "config", label: t("streams.configuration"), icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? "bg-primary-600 text-white"
                : "text-dark-muted hover:text-dark-text hover:bg-dark-border"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="card">
             <h3 className="text-lg font-semibold mb-4">{t("streams.streamInformation")}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-dark-bg/50 rounded-lg p-4">
                 <p className="text-xs text-dark-muted mb-1">{t("streams.firstSequence")}</p>
                <p className="font-mono font-medium">{streamData.state?.first_seq?.toLocaleString() || "N/A"}</p>
              </div>
              <div className="bg-dark-bg/50 rounded-lg p-4">
                 <p className="text-xs text-dark-muted mb-1">{t("streams.lastSequence")}</p>
                <p className="font-mono font-medium">{streamData.state?.last_seq?.toLocaleString() || "N/A"}</p>
              </div>
              <div className="bg-dark-bg/50 rounded-lg p-4">
                 <p className="text-xs text-dark-muted mb-1">{t("streams.created")}</p>
                <p className="text-sm">
                  {streamData.state?.first_ts ? new Date(streamData.state?.first_ts).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div className="bg-dark-bg/50 rounded-lg p-4">
                 <p className="text-xs text-dark-muted mb-1">{t("streams.lastMessage")}</p>
                <p className="text-sm">
                  {streamData.state?.last_ts ? new Date(streamData.state?.last_ts).toLocaleString() : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "messages" && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-muted" />
                <input type="text" placeholder={t("streams.searchMessagesPlaceholder")} className="input pl-10" />
              </div>
              <button
                onClick={() => navigate(`/messages`)}
                className="btn-secondary flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
            <div className="flex items-center gap-2">
               <span className="text-sm text-dark-muted">{(streamData.state?.messages || 0).toLocaleString()} {t("streams.messages")}</span>
               <button
                 onClick={() => navigate(`/messages`)}
                 className="btn-secondary text-sm py-1 px-3"
               >
                 {t("streams.viewAll")}
               </button>
            </div>
          </div>
          <div className="text-center py-8 text-dark-muted">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
             <p>{t("streams.useMessageBrowser")}</p>
             <Link
               to={`/messages?stream=${encodeURIComponent(name)}`}
               className="inline-block mt-4 btn-primary"
             >
               {t("streams.openMessageBrowser")}
             </Link>
          </div>
        </div>
      )}

      {activeTab === "consumers" && (
        <div className="space-y-4">
          {consumers.length === 0 ? (
            <div className="card text-center py-8">
              <Users className="w-12 h-12 mx-auto mb-3 text-dark-muted opacity-50" />
             <p className="text-dark-muted mb-4">{t("streams.noConsumers")}</p>
               <button onClick={() => setActiveTab("consumers")} className="btn-primary flex items-center gap-2 mx-auto">
                 <Plus className="w-4 h-4" />
                 {t("streams.createConsumer")}
               </button>
            </div>
          ) : (
            consumers.map((consumer: any) => (
              <div key={consumer.name} className="card hover:border-dark-border/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${consumer.status === "active" ? "status-success" : "status-warning"}`} />
                    <div>
                      <Link
                        to={`/consumers/${encodeURIComponent(consumer.name)}`}
                        className="font-medium text-primary-400 hover:underline"
                      >
                        {consumer.name}
                      </Link>
                       <p className="text-xs text-dark-muted mt-1">
                         {consumer.config?.durable ? t("streams.durable") : t("streams.ephemeral")}
                       </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="text-center">
                       <p className="font-medium">{(consumer.lag || 0).toLocaleString()}</p>
                       <p className="text-xs text-dark-muted">{t("streams.lag")}</p>
                     </div>
                     <div className="text-center">
                       <p className="font-medium">{consumer.ack_rate || "N/A"}</p>
                       <p className="text-xs text-dark-muted">{t("streams.ackRate")}</p>
                     </div>
                     <Link to={`/consumers/${encodeURIComponent(consumer.name)}`} className="btn-secondary text-sm">
                       {t("streams.manage")}
                     </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "config" && (
        <div className="space-y-6">
          <div className="card">
             <h3 className="text-lg font-semibold mb-4">{t("streams.streamConfiguration")}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                   <span className="text-dark-muted">{t("streams.name")}</span>
                  <span className="font-medium">{streamData.config?.name}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-dark-muted">{t("streams.storage")}</span>
                  <span className="font-medium">{streamData.config?.storage}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-dark-muted">{t("streams.retention")}</span>
                  <span className="font-medium">{streamData.config?.retention}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-dark-muted">{t("streams.replicas")}</span>
                  <span className="font-medium">{streamData.config?.replicas}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                   <span className="text-dark-muted">{t("streams.maxAge")}</span>
                  <span className="font-medium">{streamData.config?.max_age ? streamData.config.max_age : "None"}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-dark-muted">{t("streams.maxBytes")}</span>
                  <span className="font-medium">{formatBytes(streamData.config?.max_bytes || 0)}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-dark-muted">{t("streams.maxMsgSize")}</span>
                  <span className="font-medium">{formatBytes((streamData.config as any)?.max_msg_size || 0)}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-dark-muted">{t("streams.subjects")}</span>
                  <span className="font-mono text-sm">{streamData.config?.subjects?.join(", ")}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
             <h3 className="text-lg font-semibold mb-4">{t("streams.streamActions")}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
               <button onClick={handleEditConfig} className="btn-secondary flex items-center gap-2">
                 <FileText className="w-4 h-4" />
                 {t("streams.editConfig")}
               </button>
              <button
                onClick={handlePurgeStream}
                disabled={loadingAction === "purge"}
                className={`btn-secondary flex items-center gap-2 ${loadingAction === "purge" ? "opacity-50" : ""}`}
              >
                 {loadingAction === "purge" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                 {t("streams.purgeStream")}
              </button>
              <button
                onClick={handleDeleteStream}
                disabled={loadingAction === "delete"}
                className={`btn-secondary flex items-center gap-2 text-status-error ${loadingAction === "delete" ? "opacity-50" : ""}`}
              >
                 {loadingAction === "delete" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                 {t("streams.deleteStream")}
              </button>
               <button onClick={handleCloneStream} className="btn-secondary flex items-center gap-2">
                 <CopyIcon className="w-4 h-4" />
                 {t("streams.cloneStream")}
               </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <EditStreamModal
          name={name}
          editForm={editForm}
          updatePending={updatePending}
          setEditForm={setEditForm}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdateStream}
        />
      )}
    </div>
  );
}
