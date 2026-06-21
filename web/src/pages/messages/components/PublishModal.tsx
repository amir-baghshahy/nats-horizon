import { Send } from "lucide-react";

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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Publish Message</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-bg rounded-lg"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Stream</label>
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
            <label className="block text-sm font-medium mb-2">Subject</label>
            <input
              type="text"
              name="subject"
              placeholder="orders.created"
              className="input w-full font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Payload (JSON)
            </label>
            <textarea
              name="payload"
              placeholder='{"order_id": "123", "amount": 99.99}'
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isPending ? "Publishing..." : "Publish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
