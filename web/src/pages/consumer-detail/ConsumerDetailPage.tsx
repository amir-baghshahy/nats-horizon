import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Check,
  CheckCircle,
  Clock,
  Copy,
  Eye,
  FastForward,
  Loader2,
  MessageSquare,
  Pause,
  Play,
  RefreshCw,
  Settings,
  SkipBack,
  SkipForward,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useConsumerDetail } from "./hooks/useConsumerDetail";
import EditConsumerModal from "./components/EditConsumerModal";
import CloneConsumerModal from "./components/CloneConsumerModal";

export default function ConsumerDetailPage() {
  const { t } = useTranslation();
  const {
    name,
    consumerData,
    activeTab,
    isPaused,
    loadingAction,
    showEditModal,
    showCloneModal,
    cloneName,
    editForm,
    pendingMessages,
    ackPending,
    nackPending,
    termPending,
    updatePending,
    clonePending,
    setActiveTab,
    setShowEditModal,
    setShowCloneModal,
    setCloneName,
    setEditForm,
    refetch,
    refetchPending,
    handleResetLag,
    handleReplayMessages,
    handlePauseResume,
    handleDeleteConsumer,
    handleOpenEdit,
    handleOpenClone,
    handleUpdateConsumer,
    handleCloneConsumer,
    handleAck,
    handleNack,
    handleTerm,
  } = useConsumerDetail();

  if (!name) return <div>{t("consumers.notFound")}</div>;

  const StatusIcon = (() => {
    switch (consumerData.status) {
      case "active": return CheckCircle;
      case "paused": return Pause;
      case "stuck": return AlertTriangle;
      default: return TrendingUp;
    }
  })();

  return (
    <div className="p-3 md:p-4 lg:p-6">
      <div className="flex items-center gap-4 mb-4">
        <Link to="/consumers" className="p-2 hover:bg-dark-bg rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold">{name}</h1>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              consumerData.status === "active"
                ? "bg-status-success/20 text-status-success"
                : consumerData.status === "stuck"
                  ? "bg-status-error/20 text-status-error"
                  : "bg-status-warning/20 text-status-warning"
            }`}>
              <StatusIcon className="w-4 h-4" />
              <span className="text-sm font-medium capitalize">{consumerData.status}</span>
            </div>
            {consumerData.config?.durable && (
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-sm">Durable</span>
            )}
          </div>
          <p className="text-dark-muted mt-1">
            {t("consumers.stream")}:{" "}
            <Link to={`/streams/${encodeURIComponent(consumerData.stream ?? "")}`} className="text-primary-400 hover:underline">
              {consumerData.stream}
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePauseResume}
            disabled={loadingAction !== null}
            className={`btn-secondary flex items-center gap-2 ${consumerData.status === "stuck" ? "text-status-success" : ""} ${loadingAction === "pause-resume" ? "opacity-50" : ""}`}
          >
            {loadingAction === "pause-resume" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : consumerData.status === "stuck" || consumerData.status === "paused" || isPaused ? (
              <Play className="w-4 h-4" />
            ) : (
              <Pause className="w-4 h-4" />
            )}
          </button>
          <button onClick={() => refetch()} className="btn-secondary">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setActiveTab("messages")} className="btn-secondary flex items-center gap-2">
            <Eye className="w-4 h-4" />
            {t("consumers.peekMessages")}
          </button>
          <button onClick={() => setActiveTab("config")} className="btn-primary flex items-center gap-2">
            <Settings className="w-4 h-4" />
            {t("consumers.configure")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{(consumerData.lag || 0).toLocaleString()}</p>
              <p className="text-xs text-dark-muted">{t("consumers.totalLag")}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{(consumerData.num_pending || 0).toLocaleString()}</p>
              <p className="text-xs text-dark-muted">{t("consumers.pending")}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <FastForward className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{(consumerData as any).num_delivered?.toLocaleString() ?? t("common.na")}</p>
              <p className="text-xs text-dark-muted">{t("consumers.delivered")}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{(consumerData as any).ack_rate ?? t("common.na")}</p>
              <p className="text-xs text-dark-muted">{t("consumers.avgAckRate")}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{(consumerData as any).paused ? t("streams.paused") : t("consumers.active")}</p>
              <p className="text-xs text-dark-muted">{t("consumers.state")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-4 bg-dark-bg p-1 rounded-lg w-fit">
        {[
          { id: "overview", label: "Overview", icon: BarChart3 },
          { id: "messages", label: "Messages", icon: MessageSquare },
          { id: "config", label: "Configuration", icon: Settings },
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
            <h3 className="text-lg font-semibold mb-4">{t("consumers.quickActions")}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={handleResetLag}
                disabled={loadingAction === "reset-lag"}
                className={`btn-secondary flex items-center gap-2 ${loadingAction === "reset-lag" ? "opacity-50" : ""}`}
              >
                {loadingAction === "reset-lag" ? <Loader2 className="w-4 h-4 animate-spin" /> : <SkipBack className="w-4 h-4" />}
                {t("consumers.resetLag")}
              </button>
              <button
                onClick={handleReplayMessages}
                disabled={loadingAction === "replay"}
                className={`btn-secondary flex items-center gap-2 ${loadingAction === "replay" ? "opacity-50" : ""}`}
              >
                {loadingAction === "replay" ? <Loader2 className="w-4 h-4 animate-spin" /> : <SkipForward className="w-4 h-4" />}
                {t("consumers.replayMessages")}
              </button>
              <button onClick={() => setActiveTab("messages")} className="btn-secondary flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {t("consumers.peekMessages")}
              </button>
              <button
                onClick={handleDeleteConsumer}
                disabled={loadingAction === "delete"}
                className={`btn-secondary flex items-center gap-2 text-status-error ${loadingAction === "delete" ? "opacity-50" : ""}`}
              >
                {loadingAction === "delete" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "messages" && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              {t("consumers.pendingMessages", { count: pendingMessages?.messages?.length || 0 })}
            </h3>
            <button onClick={() => refetchPending()} className="btn-secondary flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              {t("common.refresh")}
            </button>
          </div>

          {!pendingMessages || !pendingMessages.messages || pendingMessages.messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-dark-muted opacity-50" />
              <h3 className="text-lg font-semibold mb-2">{t("consumers.noPendingMessages")}</h3>
              <p className="text-dark-muted">
                {consumerData.num_pending && consumerData.num_pending > 0
                  ? t("consumers.noPendingMessagesDescription", { count: consumerData.num_pending })
                  : t("consumers.noPendingMessagesDescriptionEmpty")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingMessages.messages.map((msg: any) => (
                <div key={msg.sequence} className="p-4 bg-dark-bg rounded-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm text-primary-400">#{msg.sequence}</span>
                        <span className="text-sm font-mono text-dark-muted">{msg.subject}</span>
                        <span className="text-xs text-dark-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(msg.timestamp).toLocaleString()}
                        </span>
                        <span className="text-xs text-dark-muted">{t("consumers.deliveredCount", { count: msg.num_delivered })}</span>
                      </div>
                      <pre className="text-sm p-3 bg-dark-bg rounded overflow-x-auto max-h-32">
                        <code className="text-green-400">{msg.data}</code>
                      </pre>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleAck(msg.sequence)}
                        disabled={ackPending}
                        className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"
                        title={t("consumers.ack")}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleNack(msg.sequence)}
                        disabled={nackPending}
                        className="p-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30"
                        title={t("consumers.nack")}
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleTerm(msg.sequence)}
                        disabled={termPending}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                        title={t("consumers.ackTerm")}
                      >
                        <FastForward className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "config" && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">{t("consumers.consumerConfiguration")}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-dark-bg/50 rounded-lg">
                  <span className="text-dark-muted">Durable</span>
                  <span className={`px-2 py-1 rounded text-xs ${consumerData.config?.durable ? "bg-green-500/20 text-green-400" : "bg-dark-border"}`}>
                    {consumerData.config?.durable ? t("consumers.yes") : t("consumers.no")}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-dark-bg/50 rounded-lg">
                  <span className="text-dark-muted">{t("consumers.deliveryPolicy")}</span>
                  <span className="font-medium capitalize">{consumerData.config?.deliver_policy || "all"}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-dark-bg/50 rounded-lg">
                  <span className="text-dark-muted">{t("consumers.ackPolicy")}</span>
                  <span className="font-medium capitalize">{consumerData.config?.ack_policy || "explicit"}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-dark-bg/50 rounded-lg">
                  <span className="text-dark-muted">{t("consumers.replayPolicy")}</span>
                  <span className="font-medium capitalize">{consumerData.config?.replay_policy || "instant"}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-dark-bg/50 rounded-lg">
                  <span className="text-dark-muted">{t("consumers.maxDeliveries")}</span>
                  <span className="font-medium">
                    {consumerData.config?.max_deliver === -1 ? t("common.unlimited") : consumerData.config?.max_deliver || 3}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-dark-bg/50 rounded-lg">
                  <span className="text-dark-muted">{t("consumers.ackWait")}</span>
                  <span className="font-medium">{(consumerData.config as any)?.ack_wait ?? t("common.na")}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-dark-bg/50 rounded-lg">
                  <span className="text-dark-muted">{t("consumers.maxWaiting")}</span>
                  <span className="font-medium">{(consumerData.config as any)?.max_waiting ?? t("common.na")}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-dark-bg/50 rounded-lg">
                  <span className="text-dark-muted">{t("consumers.maxBatch")}</span>
                  <span className="font-medium">{(consumerData.config as any)?.max_batch ?? t("common.na")}</span>
                </div>
              </div>
            </div>
          </div>

          {(consumerData.config as any)?.filter_subject && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">{t("consumers.filterSubject")}</h3>
              <div className="p-3 bg-dark-bg/50 rounded-lg">
                <p className="font-mono text-sm">{(consumerData.config as any).filter_subject}</p>
                <p className="text-xs text-dark-muted mt-1">{t("consumers.filterSubjectHelp")}</p>
              </div>
            </div>
          )}

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">{t("consumers.consumerActions")}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button onClick={handleOpenEdit} className="btn-secondary flex items-center gap-2">
                <Settings className="w-4 h-4" />
                {t("consumers.editConsumer")}
              </button>
              <button
                onClick={handleResetLag}
                disabled={loadingAction === "reset-lag"}
                className={`btn-secondary flex items-center gap-2 ${loadingAction === "reset-lag" ? "opacity-50" : ""}`}
              >
                {loadingAction === "reset-lag" ? <Loader2 className="w-4 h-4 animate-spin" /> : <SkipBack className="w-4 h-4" />}
                {t("consumers.resetLag")}
              </button>
              <button onClick={handleOpenClone} className="btn-secondary flex items-center gap-2">
                <Copy className="w-4 h-4" />
                {t("consumers.cloneConsumer")}
              </button>
              <button
                onClick={handleDeleteConsumer}
                disabled={loadingAction === "delete"}
                className={`btn-secondary flex items-center gap-2 text-status-error ${loadingAction === "delete" ? "opacity-50" : ""}`}
              >
                {loadingAction === "delete" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <EditConsumerModal
          name={name}
          editForm={editForm}
          updatePending={updatePending}
          setEditForm={setEditForm}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdateConsumer}
        />
      )}

      {showCloneModal && (
        <CloneConsumerModal
          name={name}
          stream={consumerData.stream}
          cloneName={cloneName}
          clonePending={clonePending}
          setCloneName={setCloneName}
          onClose={() => setShowCloneModal(false)}
          onClone={handleCloneConsumer}
        />
      )}
    </div>
  );
}
