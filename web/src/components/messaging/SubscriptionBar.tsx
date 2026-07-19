import { useTranslation } from "react-i18next";
import { X } from "lucide-react";

interface SubscriptionBarProps {
  subscriptions: Set<string>;
  onSubscribe: (subject: string) => void;
  onUnsubscribe: (subject: string) => void;
}

export default function SubscriptionBar({
  subscriptions,
  onSubscribe,
  onUnsubscribe,
}: SubscriptionBarProps) {
  const { t } = useTranslation();

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const target = e.target as HTMLInputElement;
      const subject = target.value.trim();
      if (subject) {
        onSubscribe(subject);
        target.value = "";
      }
    }
  };

  return (
    <div className="card mb-6">
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder={t("messages.enterSubjectPlaceholder")}
            className="input w-full font-mono"
            onKeyPress={handleKeyPress}
          />
          <p className="text-display-xs text-content-tertiary mt-2">
            {t("messages.subscriptionHelp")}
          </p>
        </div>

        {subscriptions.size > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {Array.from(subscriptions).map((sub) => (
              <div
                key={sub}
                className="flex items-center gap-2 px-3 py-1 bg-primary-500/20 text-primary-400 rounded-lg text-display-sm font-mono"
              >
                <span>{sub}</span>
                <button
                  onClick={() => onUnsubscribe(sub)}
                  className="hover:text-red-400 transition-colors"
                  aria-label={`${t("messages.unsubscribeFrom")} ${sub}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {subscriptions.size === 0 && (
        <p className="text-display-xs text-content-tertiary mt-2">
          {t("messages.tip")}: {t("messages.tipSingle")}{" "}
          <code className="bg-surface-primary px-1 rounded">*</code>{" "}
          {t("messages.tipAll")}{" "}
          <code className="bg-surface-primary px-1 rounded">&gt;</code>
        </p>
      )}
    </div>
  );
}
