import { useAlerts } from "./hooks/useAlerts";
import { useTranslation } from "react-i18next";
import { PageError, PageLoading } from "../../components/ui/PageState";
import AlertsHeader from "./components/AlertsHeader";
import AlertsStats from "./components/AlertsStats";
import AlertsTabs from "./components/AlertsTabs";
import AlertsFilters from "./components/AlertsFilters";
import AlertsList from "./components/AlertsList";
import AlertsTriggersList from "./components/AlertsTriggersList";
import AlertFormModal from "./components/AlertFormModal";
import type { Alert } from "../../types";

export default function AlertsPage() {
  const { t } = useTranslation();
  const {
    activeTab,
    setActiveTab,
    showCreateModal,
    setShowCreateModal,
    selectedAlert,
    setSelectedAlert,
    filterSeverity,
    setFilterSeverity,
    alerts,
    alertsLoading,
    alertsError,
    refetchAlerts,
    triggers,
    triggersLoading,
    triggersError,
    refetchTriggers,
    createAlertMutation,
    updateAlertMutation,
    deleteAlertMutation,
    toggleAlertMutation,
    ackTriggerMutation,
    checkAlertsMutation,
    confirm,
  } = useAlerts();

  const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) return error.message;
    return t("alerts.unableToLoad");
  };

  const filteredAlerts = (alerts ?? []).filter((alert: Alert) => {
    if (filterSeverity === "all") return true;
    return alert.severity === filterSeverity;
  });

  const unackedTriggers = (triggers ?? []).filter((t) => !t.acked);

  if (alertsLoading || (activeTab === "triggers" && triggersLoading)) {
    return (
      <PageLoading
        text={
          activeTab === "triggers"
            ? t("alerts.loading")
            : t("alerts.alertsLoading")
        }
      />
    );
  }

  if (alertsError || triggersError) {
    return (
      <PageError
        message={getErrorMessage(alertsError || triggersError)}
        onRetry={() => {
          refetchAlerts();
          refetchTriggers();
        }}
      />
    );
  }

  const handleDeleteAlert = async (alert: Alert) => {
    const ok = await confirm({
      title: t("alerts.deleteAlert"),
      message: t("alerts.deleteAlertConfirm", { name: alert.name }),
      confirmLabel: t("alerts.delete"),
      variant: "danger",
    });
    if (ok && alert.id) deleteAlertMutation.mutate(alert.id);
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 md:h-full md:overflow-hidden">
      <div className="shrink-0">
        <AlertsHeader
          onNewAlert={() => {
            setSelectedAlert(null);
            setShowCreateModal(true);
          }}
          onCheckAlerts={() => checkAlertsMutation.mutate()}
          isChecking={checkAlertsMutation.isPending}
        />
      </div>

      <div className="shrink-0">
        <AlertsStats alerts={alerts || []} triggers={triggers || []} />
      </div>

      <div className="shrink-0">
        <AlertsTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          unackedCount={unackedTriggers.length}
        />
      </div>

      <div className="shrink-0">
        <AlertsFilters
          filterSeverity={filterSeverity}
          onFilterChange={(value) => setFilterSeverity(value)}
        />
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        {activeTab === "alerts" && (
          <AlertsList
            alerts={filteredAlerts}
            isTogglePending={toggleAlertMutation.isPending}
            onToggle={(alert: Alert) => toggleAlertMutation.mutate(alert)}
            onEdit={(alert: Alert) => {
              setSelectedAlert(alert);
              setShowCreateModal(true);
            }}
            onDelete={handleDeleteAlert}
            confirm={confirm}
          />
        )}

        {activeTab === "triggers" && (
          <AlertsTriggersList
            triggers={triggers || []}
            isAckPending={ackTriggerMutation.isPending}
            onAcknowledge={(alertId: string) =>
              ackTriggerMutation.mutate(alertId)
            }
          />
        )}
      </div>

      <AlertFormModal
        isOpen={showCreateModal}
        alert={selectedAlert}
        isPending={
          createAlertMutation.isPending || updateAlertMutation.isPending
        }
        onClose={() => {
          setShowCreateModal(false);
          setSelectedAlert(null);
        }}
        onSubmit={(data) => {
          if (selectedAlert) {
            updateAlertMutation.mutate({ id: selectedAlert.id || "", data });
          } else {
            createAlertMutation.mutate(data);
          }
        }}
      />
    </div>
  );
}
