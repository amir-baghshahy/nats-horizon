import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { createPortal } from "react-dom";
import type { ConsumerEditForm } from "../hooks/useConsumerDetail";
import { ModalWrapper } from "../../../components/ui/Modal";

interface EditConsumerModalProps {
  name: string;
  editForm: ConsumerEditForm;
  updatePending: boolean;
  setEditForm: (form: ConsumerEditForm) => void;
  onClose: () => void;
  onSave: () => void;
}

export default function EditConsumerModal({
  name,
  editForm,
  updatePending,
  setEditForm,
  onClose,
  onSave,
}: EditConsumerModalProps) {
  const { t } = useTranslation();

  return createPortal(
    <ModalWrapper isOpen={true}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="card w-full max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{t("consumers.editConsumer", { name })}</h2>
          <button onClick={onClose} className="p-2 hover:bg-dark-bg rounded-lg">
            <span className="text-dark-muted">✕</span>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-dark-muted mb-1">{t("consumers.ackPolicy")}</label>
            <select className="input w-full" value={editForm.ack_policy} onChange={(e) => setEditForm({ ...editForm, ack_policy: e.target.value })}>
              <option value="explicit">{t("consumers.explicit")}</option>
              <option value="all">{t("common.all")}</option>
              <option value="none">{t("common.none")}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-dark-muted mb-1">{t("consumers.deliveryPolicy")}</label>
            <select className="input w-full" value={editForm.deliver_policy} onChange={(e) => setEditForm({ ...editForm, deliver_policy: e.target.value })}>
              <option value="all">{t("common.all")}</option>
              <option value="last">{t("consumers.last")}</option>
              <option value="new">{t("consumers.new")}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-dark-muted mb-1">{t("consumers.replayPolicy")}</label>
            <select className="input w-full" value={editForm.replay_policy} onChange={(e) => setEditForm({ ...editForm, replay_policy: e.target.value })}>
              <option value="instant">{t("consumers.instant")}</option>
              <option value="original">{t("consumers.original")}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-dark-muted mb-1">{t("consumers.maxDeliverLabel")}</label>
            <input type="number" className="input w-full" min={-1} value={editForm.max_deliver} onChange={(e) => setEditForm({ ...editForm, max_deliver: parseInt(e.target.value) || -1 })} />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-6">
          <button onClick={onClose} className="btn-secondary">{t("common.cancel")}</button>
          <button onClick={onSave} disabled={updatePending} className="btn-primary flex items-center gap-2">
            {updatePending && <Loader2 className="w-4 h-4 animate-spin" />}
            {t("common.save")}
          </button>
        </div>
      </div>
      </div>
    </ModalWrapper>,
    document.body
  );
}
