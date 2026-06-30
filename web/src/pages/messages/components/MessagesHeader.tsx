import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Download, Trash2, Send } from "lucide-react";
import Button from "../../../components/ui/Button";
import { PageHeader } from "../../../components/ui";

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
  const { t } = useTranslation();
  return (
    <PageHeader
      title={title}
      subtitle={description}
      actions={
        <>
          {selectedCount > 0 && (
            <>
              <Button
                onClick={onExport}
                variant="secondary"
                icon={<Download className="w-4 h-4" />}
              >
                {t('messages.exportCount', { count: selectedCount })}
              </Button>
              <Button
                onClick={onDelete}
                disabled={isDeletePending}
                variant="secondary"
                icon={<Trash2 className="w-4 h-4" />}
                className="text-status-error"
              >
                {t('messages.deleteCount', { count: selectedCount })}
              </Button>
            </>
          )}
          <Button
            onClick={onPublish}
            variant="primary"
            icon={<Send className="w-4 h-4" />}
          >
            {t('messages.publishMessage')}
          </Button>
          {rightElement}
        </>
      }
    />
  );
}
