import { useNavigate } from "react-router-dom";
import { useStreamsPage } from "./hooks/useStreamsPage";
import StreamsFilters from "./components/StreamsFilters";
import StreamsHeader from "./components/StreamsHeader";
import StreamsList from "./components/StreamsList";
import StreamsStats from "./components/StreamsStats";
import CreateStreamModal from "./components/CreateStreamModal";
import type { CreateStreamRequest } from "../../types";

export default function StreamsPage() {
  const navigate = useNavigate();
  const {
    filteredStreams,
    paginatedStreams,
    stats,
    selected,
    page,
    isLoading,
    sseConnected,
    showCreateModal,
    createPending,
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    toggleSelection,
    clearSelection,
    isSelected,
    toggleExpansion,
    isExpanded,
    goToPage,
    refetch,
    setShowCreateModal,
    createMutation,
    handleDelete,
    handlePurge,
    handleExportStream,
    handleExportMessages,
    handleExportAll,
    handleBulkDelete,
    handleSelectAll,
    getStreamHealthStatus,
    getStreamName,
  } = useStreamsPage();

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 animate-fade-in md:h-full md:overflow-hidden">
      {/* Header Section */}
      <section className="shrink-0">
        <StreamsHeader
          sseConnected={sseConnected}
          onShowCreateModal={() => setShowCreateModal(true)}
          onRefetch={refetch}
        />
      </section>

      {/* Stats Section */}
      <section className="shrink-0 animate-slide-up">
        <StreamsStats stats={stats} />
      </section>

      {/* Filters & List Section */}
      <section className="flex-1 min-h-0 flex flex-col gap-4 animate-slide-up animate-delay-100">
        <div className="shrink-0">
          <StreamsFilters
            filters={filters}
            hasActiveFilters={hasActiveFilters}
            updateFilter={updateFilter}
            resetFilters={resetFilters}
          />
        </div>

        <StreamsList
          streams={paginatedStreams}
          filteredStreams={filteredStreams}
          isLoading={isLoading}
          selected={selected}
          page={page}
          hasActiveFilters={hasActiveFilters}
          toggleSelection={toggleSelection}
          clearSelection={clearSelection}
          isSelected={isSelected}
          toggleExpansion={toggleExpansion}
          isExpanded={isExpanded}
          goToPage={goToPage}
          onViewDetails={(streamName) =>
            navigate(`/streams/${encodeURIComponent(streamName)}`)
          }
          onDelete={handleDelete}
          onPurge={handlePurge}
          onExportStream={handleExportStream}
          onExportMessages={handleExportMessages}
          onExportAll={handleExportAll}
          onBulkDelete={handleBulkDelete}
          onSelectAll={handleSelectAll}
          getStreamHealthStatus={getStreamHealthStatus}
          getStreamName={getStreamName}
        />
      </section>

      {showCreateModal && (
        <CreateStreamModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={(data: CreateStreamRequest) => createMutation.mutate(data)}
          isPending={createPending}
        />
      )}
    </div>
  );
}
