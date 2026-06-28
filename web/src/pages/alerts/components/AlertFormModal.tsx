import type { Alert } from "../../../types";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { ModalWrapper } from "../../../components/ui/Modal";

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
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    // Collect selected channels
    const channels: string[] = [];
    if ((formData.get("channel_email") as string) === "on")
      channels.push("email");
    if ((formData.get("channel_webhook") as string) === "on")
      channels.push("webhook");
    if ((formData.get("channel_slack") as string) === "on")
      channels.push("slack");

    const data: Partial<Alert> = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      severity: formData.get("severity") as Alert["severity"],
      enabled: formData.get("enabled") === "true",
      condition: {
        type: formData.get("condition_type") as string,
        stream: formData.get("stream") as string,
        consumer: formData.get("consumer") as string,
        threshold: parseInt(formData.get("threshold") as string),
        operator: formData.get("operator") as string,
      },
      channels,
      cooldown: 300000000000 as any, // 5 minutes in nanoseconds
    };
    onSubmit(data);
  };

  return createPortal(
    <ModalWrapper isOpen={isOpen}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="card max-w-lg w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {alert ? t("alerts.editAlert") : t("alerts.createAlert")}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-dark-bg rounded-lg">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
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
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("alerts.description")}
            </label>
            <textarea
              name="description"
              defaultValue={alert?.description}
              placeholder={t("alerts.descriptionPlaceholder")}
              rows={2}
              className="input w-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("alerts.conditionType")}
              </label>
              <select
                name="condition_type"
                defaultValue={alert?.condition?.type || "lag"}
                className="input w-full"
              >
                <option value="lag">{t("alerts.consumerLag")}</option>
                <option value="storage">{t("alerts.storageUsage")}</option>
                <option value="messages">{t("alerts.messageCount")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("alerts.severity")}
              </label>
              <select
                name="severity"
                defaultValue={alert?.severity || "warning"}
                className="input w-full"
              >
                <option value="info">{t("alerts.info")}</option>
                <option value="warning">{t("alerts.warning")}</option>
                <option value="critical">{t("alerts.critical")}</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("alerts.operator")}
              </label>
              <select
                name="operator"
                defaultValue={alert?.condition?.operator || ">"}
                className="input w-full"
              >
                <option value=">">{t("alerts.greaterThan")}</option>
                <option value="<">{t("alerts.lessThan")}</option>
                <option value=">=">{t("alerts.greaterOrEqual")}</option>
                <option value="<=">{t("alerts.lessOrEqual")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("alerts.threshold")}
              </label>
              <input
                type="number"
                name="threshold"
                defaultValue={alert?.condition?.threshold || 1000}
                className="input w-full"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
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
            <label className="block text-sm font-medium mb-2">
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
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("alerts.notificationChannels")}
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="channel_email"
                  defaultChecked={alert?.channels?.includes("email")}
                  className="rounded"
                />
                <span className="text-sm">{t("alerts.email")}</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="channel_webhook"
                  defaultChecked={alert?.channels?.includes("webhook")}
                  className="rounded"
                />
                <span className="text-sm">{t("alerts.webhook")}</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="channel_slack"
                  defaultChecked={alert?.channels?.includes("slack")}
                  className="rounded"
                />
                <span className="text-sm">{t("alerts.slack")}</span>
              </label>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="enabled"
              id="enabled"
              defaultChecked={alert?.enabled ?? true}
              value="true"
            />
            <label htmlFor="enabled" className="text-sm">
              {t("alerts.enableAlert")}
            </label>
          </div>
          <div className="flex items-center gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              {t("common.cancel")}
            </button>
            <button type="submit" disabled={isPending} className="btn-primary">
              {alert ? t("alerts.update") : t("alerts.create")} Alert
            </button>
          </div>
        </form>
      </div>
    </div>
      </ModalWrapper>,
    document.body,
  );
}
