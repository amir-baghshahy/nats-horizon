import type { Alert } from "../../../types";
import { ModalWrapper } from "../../../components/ui/Modal";
import { useTranslation } from "react-i18next";
import { Mail, Webhook, Hash, X } from "lucide-react";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import { useState } from "react";
import { createPortal } from "react-dom";
import { getString, getNumber, getBoolean } from "../../../utils/formData";

interface AlertFormModalProps {
  isOpen: boolean;
  alert: Alert | null;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Alert>) => void;
}

export default function AlertFormModal({
  isOpen,
  alert,
  isPending,
  onClose,
  onSubmit,
}: AlertFormModalProps) {
  const { t } = useTranslation();
  const [conditionType, setConditionType] = useState(
    alert?.condition?.type || "lag",
  );
  const [operator, setOperator] = useState(alert?.condition?.operator || ">");
  const [severity, setSeverity] = useState(alert?.severity || "warning");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const channels: string[] = [];
    if (getBoolean(formData, "channel_email")) channels.push("email");
    if (getBoolean(formData, "channel_webhook")) channels.push("webhook");
    if (getBoolean(formData, "channel_slack")) channels.push("slack");

    const data: Partial<Alert> = {
      name: getString(formData, "name"),
      description: getString(formData, "description"),
      severity: severity as Alert["severity"],
      enabled: getBoolean(formData, "enabled"),
      condition: {
        type: conditionType as string,
        stream: getString(formData, "stream"),
        consumer: getString(formData, "consumer"),
        threshold: getNumber(formData, "threshold", 1000),
        operator: operator as string,
      },
      channels,
      email_address: getString(formData, "email_address"),
      webhook_url: getString(formData, "webhook_url"),
      slack_webhook_url: getString(formData, "slack_webhook_url"),
      cooldown: 300000000000,
    };
    onSubmit(data);
  };

  return createPortal(
    <ModalWrapper isOpen={true} onClose={onClose}>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className="card w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-labelledby="alert-modal-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-default flex-shrink-0">
            <h2 id="alert-modal-title" className="text-display-sm font-bold">
              {alert ? t("alerts.editAlert") : t("alerts.createAlert")}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-surface-primary rounded-lg transition-colors"
            >
              <X className="icon-base" />
            </button>
          </div>

          {/* Scrollable Content */}
          <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5">
            <div className="space-y-5">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-display-sm font-medium mb-1.5">
                    {t("alerts.alertName")}
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={alert?.name}
                    placeholder={t("alerts.alertNamePlaceholder")}
                    className="input w-full"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-display-sm font-medium mb-1.5">
                    {t("alerts.description")}
                  </label>
                  <textarea
                    name="description"
                    defaultValue={alert?.description}
                    placeholder={t("alerts.descriptionPlaceholder")}
                    rows={2}
                    className="input w-full resize-none"
                  />
                </div>
              </div>

              {/* Condition */}
              <div className="border border-border-default rounded-xl p-4 space-y-4">
                <h3 className="text-display-sm font-semibold text-content-tertiary uppercase tracking-wide">
                  {t("alerts.conditionType")}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-display-xs text-content-tertiary mb-1">
                      Type
                    </label>
                    <Select
                      value={conditionType}
                      onChange={setConditionType}
                      options={[
                        { value: "lag", label: t("alerts.consumerLag") },
                        { value: "storage", label: t("alerts.storageUsage") },
                        { value: "messages", label: t("alerts.messageCount") },
                      ]}
                      className="w-full"
                      aria-label={t("alerts.conditionType")}
                    />
                  </div>
                  <div>
                    <label className="block text-display-xs text-content-tertiary mb-1">
                      Operator
                    </label>
                    <Select
                      value={operator}
                      onChange={setOperator}
                      options={[
                        { value: ">", label: ">" },
                        { value: "<", label: "<" },
                        { value: ">=", label: ">=" },
                        { value: "<=", label: "<=" },
                      ]}
                      className="w-full"
                      aria-label={t("alerts.operator")}
                    />
                  </div>
                  <div>
                    <label className="block text-display-xs text-content-tertiary mb-1">
                      Threshold
                    </label>
                    <input
                      type="number"
                      name="threshold"
                      defaultValue={alert?.condition?.threshold || 1000}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-display-xs text-content-tertiary mb-1">
                      Severity
                    </label>
                    <Select
                      value={severity}
                      onChange={setSeverity}
                      options={[
                        { value: "info", label: t("alerts.info") },
                        { value: "warning", label: t("alerts.warning") },
                        { value: "critical", label: t("alerts.critical") },
                      ]}
                      className="w-full"
                      aria-label={t("alerts.severity")}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-display-xs text-content-tertiary mb-1">
                      {t("alerts.streamNameOptional")}
                    </label>
                    <input
                      type="text"
                      name="stream"
                      defaultValue={alert?.condition?.stream || ""}
                      placeholder={t("alerts.streamNamePlaceholder")}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-display-xs text-content-tertiary mb-1">
                      {t("alerts.consumerNameOptional")}
                    </label>
                    <input
                      type="text"
                      name="consumer"
                      defaultValue={alert?.condition?.consumer || ""}
                      placeholder={t("alerts.consumerNamePlaceholder")}
                      className="input w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Notification Channels */}
              <div className="border border-border-default rounded-xl p-4 space-y-4">
                <h3 className="text-display-sm font-semibold text-content-tertiary uppercase tracking-wide">
                  {t("alerts.notificationChannels")}
                </h3>

                {/* Email */}
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-primary/50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      name="channel_email"
                      defaultChecked={alert?.channels?.includes("email")}
                      className="rounded"
                    />
                    <div className="avatar rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Mail className="icon-base text-blue-400" />
                    </div>
                    <span className="text-display-sm font-medium">
                      {t("alerts.email")}
                    </span>
                  </label>
                  <input
                    type="email"
                    name="email_address"
                    defaultValue={alert?.email_address || ""}
                    placeholder={t("alerts.emailPlaceholder")}
                    className="input w-full"
                  />
                </div>

                {/* Webhook */}
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-primary/50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      name="channel_webhook"
                      defaultChecked={alert?.channels?.includes("webhook")}
                      className="rounded"
                    />
                    <div className="avatar rounded-lg bg-green-500/20 flex items-center justify-center">
                      <Webhook className="icon-base text-green-400" />
                    </div>
                    <span className="text-display-sm font-medium">
                      {t("alerts.webhook")}
                    </span>
                  </label>
                  <input
                    type="url"
                    name="webhook_url"
                    defaultValue={alert?.webhook_url || ""}
                    placeholder={t("alerts.webhookPlaceholder")}
                    className="input w-full"
                  />
                </div>

                {/* Slack */}
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-primary/50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      name="channel_slack"
                      defaultChecked={alert?.channels?.includes("slack")}
                      className="rounded"
                    />
                    <div className="avatar rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Hash className="icon-base text-purple-400" />
                    </div>
                    <span className="text-display-sm font-medium">
                      {t("alerts.slack")}
                    </span>
                  </label>
                  <input
                    type="url"
                    name="slack_webhook_url"
                    defaultValue={alert?.slack_webhook_url || ""}
                    placeholder={t("alerts.slackPlaceholder")}
                    className="input w-full"
                  />
                </div>
              </div>

              {/* Enable Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="enabled"
                  id="enabled"
                  defaultChecked={alert?.enabled ?? true}
                  value="true"
                />
                <label htmlFor="enabled" className="text-display-sm">
                  {t("alerts.enableAlert")}
                </label>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-5 border-t border-border-default flex-shrink-0">
            <Button type="button" onClick={onClose} variant="secondary">
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              variant="primary"
              loading={isPending}
              onClick={(e) => {
                const form = (e.target as HTMLElement)
                  .closest(".card")
                  ?.querySelector("form");
                if (form) form.requestSubmit();
              }}
            >
              {alert ? t("alerts.update") : t("alerts.create")} Alert
            </Button>
          </div>
        </div>
      </div>
    </ModalWrapper>,
    document.body,
  );
}
