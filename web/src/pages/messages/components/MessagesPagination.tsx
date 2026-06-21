import { RefreshCw } from "lucide-react";

interface MessagesPaginationProps {
  currentPage: number;
  messagesPerPage: number;
  totalMessages: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onRefresh: () => void;
}

export default function MessagesPagination({
  currentPage,
  messagesPerPage,
  totalMessages,
  onPageChange,
  onPerPageChange,
  onRefresh,
}: MessagesPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalMessages / messagesPerPage));

  return (
    <div className="card mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-dark-muted">
            Showing {(currentPage - 1) * messagesPerPage + 1}-
            {Math.min(currentPage * messagesPerPage, totalMessages)} of{" "}
            {totalMessages.toLocaleString()} messages
          </span>
          <select
            value={messagesPerPage}
            onChange={(e) => onPerPageChange(parseInt(e.target.value))}
            className="input py-1 text-sm w-24"
            aria-label="Messages per page"
          >
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="btn-secondary text-sm py-1 px-3 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-dark-muted">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="btn-secondary text-sm py-1 px-3 disabled:opacity-50"
          >
            Next
          </button>
          <button
            onClick={onRefresh}
            className="btn-secondary text-sm py-1 px-3 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
