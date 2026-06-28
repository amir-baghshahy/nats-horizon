import { Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";
import { ModalWrapper } from "../../../components/ui/Modal";

interface PublishModalProps {
  streams: any[];
  defaultStream?: string;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (data: { stream: string; subject: string; data: string }) => void;
}

export default function PublishModal({
  streams,
  defaultStream = "",
  isPending,
  onClose,
  onSubmit,
}: PublishModalProps) {
  const { t } = useTranslation();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    onSubmit({
      stream: (formData.get("stream") as string) || defaultStream,
      subject: formData.get("subject") as string,
      data: formData.get("payload") as string,
    });
  };

  return createPortal(
    <ModalWrapper isOpen={true}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{t('messages.publishMessage')}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-dark-bg rounded-lg"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('messages.stream')}</label>
              <select
                name="stream"
                className="input w-full"
                defaultValue={defaultStream}
              >
                {streams?.map((stream: any) => (
                  <option
                    key={stream.config?.name || ""}
                    value={stream.config?.name || ""}
                  >
                    {stream.config?.name || ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('messages.subject')}</label>
              <input
                type="text"
                name="subject"
                placeholder={t('messages.subjectPlaceholder')}
                className="input w-full font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t('messages.payloadJson')}
              </label>
              <textarea
                name="payload"
                placeholder={t('messages.payloadPlaceholder')}
                className="input w-full font-mono h-40"
                required
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="btn-primary flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {isPending ? t('messages.publishing') : t('messages.publish')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalWrapper>,
    document.body
  );
}
