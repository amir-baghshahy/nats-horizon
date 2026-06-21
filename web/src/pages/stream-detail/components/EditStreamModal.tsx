import { Loader2 } from "lucide-react";
import type { StreamEditForm } from "../hooks/useStreamDetail";

interface EditStreamModalProps {
  name: string;
  editForm: StreamEditForm;
  updatePending: boolean;
  setEditForm: (form: StreamEditForm) => void;
  onClose: () => void;
  onSave: () => void;
}

export default function EditStreamModal({
  name,
  editForm,
  updatePending,
  setEditForm,
  onClose,
  onSave,
}: EditStreamModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-card rounded-xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-dark-border">
          <h2 className="text-xl font-semibold">Edit Stream: {name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-bg rounded-lg transition-colors text-dark-muted"
          >
            ✕
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-dark-muted mb-1">Subjects (comma-separated)</label>
            <input
              type="text"
              className="input w-full"
              value={editForm.subjects}
              onChange={(e) => setEditForm({ ...editForm, subjects: e.target.value })}
              placeholder="orders.*, events.*"
            />
          </div>
          <div>
            <label className="block text-sm text-dark-muted mb-1">Replicas</label>
            <input
              type="number"
              className="input w-full"
              min={1}
              max={5}
              value={editForm.replicas}
              onChange={(e) => setEditForm({ ...editForm, replicas: parseInt(e.target.value) || 1 })}
            />
          </div>
          <div>
            <label className="block text-sm text-dark-muted mb-1">Max Age (e.g. 24h, 7d — empty = unlimited)</label>
            <input
              type="text"
              className="input w-full"
              value={editForm.max_age}
              onChange={(e) => setEditForm({ ...editForm, max_age: e.target.value })}
              placeholder="24h"
            />
          </div>
          <div>
            <label className="block text-sm text-dark-muted mb-1">Max Bytes (0 = unlimited)</label>
            <input
              type="number"
              className="input w-full"
              min={0}
              value={editForm.max_bytes}
              onChange={(e) => setEditForm({ ...editForm, max_bytes: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 p-6 border-t border-dark-border">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={updatePending}
            className="btn-primary flex items-center gap-2"
          >
            {updatePending && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
