import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useConsumersPage } from "./hooks/useConsumersPage";
import ConsumersFilters from "./components/ConsumersFilters";
import ConsumersHeader from "./components/ConsumersHeader";
import ConsumersList from "./components/ConsumersList";
import { ConsumersStats } from "./components/ConsumersHeader";

export default function ConsumersPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    searchQuery,
    selectedStream,
    filterStatus,
    showMoreFilters,
    selectedConsumers,
    filteredConsumers,
    totalConsumers,
    stats,
    streamOptions,
    activeFilterCount,
    isLoading,
    sseConnected,
    pauseResumePending,
    resetLagPending,
    deletePending,
    setSearchQuery,
    setSelectedStream,
    setFilterStatus,
    setShowMoreFilters,
    toggleConsumerSelection,
    toggleExpand,
    isConsumerExpanded,
    refetch,
    handleBulkResume,
    handleBulkPause,
    handleBulkDelete,
    handleTogglePauseResume,
    handleResetLag,
    handleDeleteConsumer,
    getStatusIcon,
    getStatusLabel,
    getLagColor,
    clearFilters,
    toggleAll,
  } = useConsumersPage();

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 animate-fade-in md:h-full md:overflow-hidden">
      {/* Header Section */}
      <section className="shrink-0">
        <ConsumersHeader
          sseConnected={sseConnected}
          selectedCount={selectedConsumers.size}
          pauseResumePending={pauseResumePending}
          deletePending={deletePending}
          onBulkResume={handleBulkResume}
          onBulkPause={handleBulkPause}
          onBulkDelete={handleBulkDelete}
          onRefetch={refetch}
          onNavigateStreams={() => navigate("/streams")}
        />
      </section>

      {/* Stats Section */}
      <section className="shrink-0 animate-slide-up">
        <ConsumersStats stats={stats} />
      </section>

      {/* Filters & List Section */}
      <section className="flex-1 min-h-0 flex flex-col gap-4 animate-slide-up animate-delay-100">
        <div className="shrink-0">
        <ConsumersFilters
          searchQuery={searchQuery}
          selectedStream={selectedStream}
          filterStatus={filterStatus}
          showMoreFilters={showMoreFilters}
          streamOptions={streamOptions}
          activeFilterCount={activeFilterCount}
          onSearchChange={setSearchQuery}
          onStreamChange={setSelectedStream}
          onStatusChange={setFilterStatus}
          onShowMoreFiltersToggle={() => setShowMoreFilters(!showMoreFilters)}
          onClear={clearFilters}
          getStatusLabel={getStatusLabel}
        />
        </div>

        <ConsumersList
          consumers={filteredConsumers}
          isLoading={isLoading}
          selectedConsumers={selectedConsumers}
          resetLagPending={resetLagPending}
          onToggleAll={toggleAll}
          onToggleSelection={toggleConsumerSelection}
          onToggleExpansion={toggleExpand}
          isConsumerExpanded={isConsumerExpanded}
          onTogglePauseResume={handleTogglePauseResume}
          onViewDetails={(name) => navigate(`/consumers/${encodeURIComponent(name)}`)}
          onResetLag={handleResetLag}
          onDelete={handleDeleteConsumer}
          getStatusIcon={getStatusIcon}
          getStatusLabel={getStatusLabel}
          getLagColor={getLagColor}
        />

        <div className="shrink-0 flex items-center justify-between text-display-sm text-content-tertiary">
          <span>
            {t('consumers.showingConsumers', { filtered: filteredConsumers.length, total: totalConsumers })}
          </span>
        </div>
      </section>
    </div>
  );
}
