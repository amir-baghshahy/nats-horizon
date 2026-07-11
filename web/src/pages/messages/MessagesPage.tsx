import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useMessages } from "./hooks/useMessages";
import { CoreMessagingContent } from "../CoreMessaging";
import MessagesHeader from "./components/MessagesHeader";
import MessagesTabs from "./components/MessagesTabs";
import StreamSelector from "./components/StreamSelector";
import MessagesPagination from "./components/MessagesPagination";
import MessagesList from "./components/MessagesList";
import PublishModal from "./components/PublishModal";

export default function MessagesPage() {
  const { t } = useTranslation();
  const {
    streams,
    selectedStream,
    searchQuery,
    selectedMessages,
    expandedMessages,
    showPublishModal,
    activeMessageTab,
    messagesPerPage,
    currentPage,
    showFilters,
    viewMode,
    copiedMessage,
    isLoading,
    publishPending,
    deletePending,
    messages,
    totalMessages,
    setSelectedStream,
    setSearchQuery,
    setShowPublishModal,
    setActiveMessageTab,
    setMessagesPerPage,
    setCurrentPage,
    setShowFilters,
    setViewMode,
    toggleMessageSelection,
    toggleMessageExpansion,
    selectAllMessages,
    clearMessageSelection,
    handlePublish,
    handleDeleteMessage,
    handleBulkDelete,
    handleExportSelected,
    copyMessageData,
    refetch,
  } = useMessages();

  useEffect(() => {
    if (!selectedStream && streams[0]?.config?.name) {
      setSelectedStream(streams[0].config.name);
    }
  }, [streams, selectedStream, setSelectedStream]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStream, messagesPerPage, setCurrentPage]);

  const handleSelectAll = () => {
    if (selectedMessages.size === messages.length && messages.length > 0) {
      clearMessageSelection();
    } else {
      selectAllMessages();
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 animate-fade-in md:h-full md:overflow-hidden">
      {/* Header Section */}
      <section className="shrink-0">
        <MessagesHeader
          title={t('messages.messageBrowser')}
          description={t('messages.messageBrowserDescription')}
          selectedCount={selectedMessages.size}
          onExport={handleExportSelected}
          onDelete={handleBulkDelete}
          onPublish={() => setShowPublishModal(true)}
          isDeletePending={deletePending}
        />
      </section>

      {/* Tabs Section */}
      <section className="shrink-0">
        <MessagesTabs
          activeTab={activeMessageTab}
          onTabChange={setActiveMessageTab}
        />
      </section>

      {activeMessageTab === "stream" && (
        <section className="flex-1 min-h-0 flex flex-col gap-4 animate-slide-up">
          <div className="shrink-0">
            <StreamSelector
              streams={streams}
              selectedStream={selectedStream}
              searchQuery={searchQuery}
              showFilters={showFilters}
              onStreamChange={setSelectedStream}
              onSearchChange={setSearchQuery}
              onToggleFilters={() => setShowFilters(!showFilters)}
              onRefresh={refetch}
            />
          </div>

          <div className="shrink-0">
            <MessagesPagination
              currentPage={currentPage}
              messagesPerPage={messagesPerPage}
              totalMessages={totalMessages}
              onPageChange={setCurrentPage}
              onPerPageChange={setMessagesPerPage}
              onRefresh={refetch}
            />
          </div>

          <MessagesList
            messages={messages}
            isLoading={isLoading}
            selected={selectedMessages}
            viewMode={viewMode}
            expanded={expandedMessages}
            copiedMessage={copiedMessage}
            isDeletePending={deletePending}
            onSelectAll={handleSelectAll}
            onToggleSelection={toggleMessageSelection}
            onToggleExpand={toggleMessageExpansion}
            onCopy={copyMessageData}
            onDelete={handleDeleteMessage}
            setViewMode={setViewMode}
          />

          {showPublishModal && (
            <PublishModal
              streams={streams}
              defaultStream={selectedStream}
              isPending={publishPending}
              onClose={() => setShowPublishModal(false)}
              onSubmit={handlePublish}
            />
          )}
        </section>
      )}

      {activeMessageTab === "core" && (
        <section className="flex-1 min-h-0 animate-slide-up">
          <CoreMessagingContent />
        </section>
      )}
    </div>
  );
}
