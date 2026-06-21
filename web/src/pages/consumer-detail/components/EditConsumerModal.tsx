import { Loader2 } from "lucide-react";
import type { ConsumerEditForm } from "../hooks/useConsumerDetail";

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
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-card rounded-xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-dark-border">
          <h2 className="text-xl font-semibold">Edit Consumer: {name}</h2>
          <button onClick={onClose} className="p-2 hover:bg-dark-bg rounded-lg transition-colors text-dark-muted">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-dark-muted mb-1">Ack Policy</label>
            <select className="input w-full" value={editForm.ack_policy} onChange={(e) => setEditForm({ ...editForm, ack_policy: e.target.value })}>
              <option value="explicit">Explicit</option>
              <option value="all">All</option>
              <option value="none">None</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-dark-muted mb-1">Deliver Policy</label>
            <select className="input w-full" value={editForm.deliver_policy} onChange={(e) => setEditForm({ ...editForm, deliver_policy: e.target.value })}>
              <option value="all">All</option>
              <option value="last">Last</option>
              <option value="new">New</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-dark-muted mb-1">Replay Policy</label>
            <select className="input w-full" value={editForm.replay_policy} onChange={(e) => setEditForm({ ...editForm, replay_policy: e.target.value })}>
              <option value="instant">Instant</option>
              <option value="original">Original</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-dark-muted mb-1">Max Deliver (-1 = unlimited)</label>
            <input type="number" className="input w-full" min={-1} value={editForm.max_deliver} onChange={(e) => setEditForm({ ...editForm, max_deliver: parseInt(e.target.value) || -1 })} />
          </div>
        </div>
        <div className="flex justify-end gap-3 p-6 border-t border-dark-border">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={onSave} disabled={updatePending} className="btn-primary flex items-center gap-2">
            {updatePending && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
