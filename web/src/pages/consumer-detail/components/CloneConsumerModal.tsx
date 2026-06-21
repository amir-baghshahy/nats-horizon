import { Loader2 } from "lucide-react";

interface CloneConsumerModalProps {
  name: string;
  stream: string;
  cloneName: string;
  clonePending: boolean;
  setCloneName: (value: string) => void;
  onClose: () => void;
  onClone: () => void;
}

export default function CloneConsumerModal({
  stream,
  cloneName,
  clonePending,
  setCloneName,
  onClose,
  onClone,
}: CloneConsumerModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-card rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-dark-border">
          <h2 className="text-xl font-semibold">Clone Consumer</h2>
          <button onClick={onClose} className="p-2 hover:bg-dark-bg rounded-lg transition-colors text-dark-muted">✕</button>
        </div>
        <div className="p-6">
          <label className="block text-sm text-dark-muted mb-1">New Consumer Name</label>
          <input type="text" className="input w-full" value={cloneName} onChange={(e) => setCloneName(e.target.value)} placeholder="my-consumer-copy" />
          <p className="text-xs text-dark-muted mt-2">
            Creates a new durable consumer on stream <span className="font-mono">{stream}</span> with the same configuration.
          </p>
        </div>
        <div className="flex justify-end gap-3 p-6 border-t border-dark-border">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={onClone} disabled={clonePending || !cloneName.trim()} className="btn-primary flex items-center gap-2">
            {clonePending && <Loader2 className="w-4 h-4 animate-spin" />}
            Clone
          </button>
        </div>
      </div>
    </div>
  );
}
