import { ReactNode } from "react";
import { Download, Trash2, Send } from "lucide-react";

interface MessagesHeaderProps {
  title: string;
  description: string;
  selectedCount: number;
  onExport: () => void;
  onDelete: () => void;
  onPublish: () => void;
  isDeletePending?: boolean;
  rightElement?: ReactNode;
}

export default function MessagesHeader({
  title,
  description,
  selectedCount,
  onExport,
  onDelete,
  onPublish,
  isDeletePending = false,
  rightElement,
}: MessagesHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
        <p className="text-dark-muted mt-1">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        {selectedCount > 0 && (
          <>
            <button
              onClick={onExport}
              className="btn-secondary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export ({selectedCount})
            </button>
            <button
              onClick={onDelete}
              disabled={isDeletePending}
              className="btn-secondary flex items-center gap-2 text-status-error"
            >
              <Trash2 className="w-4 h-4" />
              Delete ({selectedCount})
            </button>
          </>
        )}
        <button
          onClick={onPublish}
          className="btn-primary flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Publish Message
        </button>
        {rightElement}
      </div>
    </div>
  );
}
