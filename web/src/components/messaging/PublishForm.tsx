import { useTranslation } from 'react-i18next';
import { Send } from "lucide-react";
import { validateSubject, validateJSON } from "../../utils/validators";
import { Button } from "../ui";

export interface PublishForm {
  subject: string;
  payload: string;
  replyTo: string;
  headers: string;
}

interface PublishFormProps {
  form: PublishForm;
  onChange: (form: PublishForm) => void;
  onSubmit: () => void;
  errors?: Record<string, string>;
}

export default function PublishForm({
  form,
  onChange,
  onSubmit,
  errors = {},
}: PublishFormProps) {
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const subjectValidation = validateSubject(form.subject);
    if (!subjectValidation.valid) {
      return;
    }

    if (form.headers) {
      const headersValidation = validateJSON(form.headers);
      if (!headersValidation.valid) {
        return;
      }
    }

    onSubmit();
  };

  const updateField = (field: keyof PublishForm, value: string) => {
    onChange({ ...form, [field]: value });
  };

  return (
    <div className="card max-w-2xl">
      <h2 className="text-display-xl font-bold mb-6 flex items-center gap-2">
        <Send className="icon-md" />
        {t('messages.publishMessage')}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-display-sm font-medium mb-2">{t('messages.subject')}</label>
          <p className="text-display-xs text-content-tertiary mb-2">
            {t('messages.subjectHelp')}
          </p>
          <input
            type="text"
            placeholder={t('messages.subjectPlaceholder')}
            value={form.subject}
            onChange={(e) => updateField("subject", e.target.value)}
            className="input w-full font-mono"
            required
          />
          {errors.subject && (
            <p className="text-red-400 text-display-xs mt-1">{errors.subject}</p>
          )}
        </div>

        <div>
          <label className="block text-display-sm font-medium mb-2">
            {t('messages.replyTo')} ({t('common.optional')})
          </label>
          <input
            type="text"
            placeholder={t('messages.replyToPlaceholder')}
            value={form.replyTo}
            onChange={(e) => updateField("replyTo", e.target.value)}
            className="input w-full font-mono"
          />
        </div>

        <div>
          <label className="block text-display-sm font-medium mb-2">
            {t('messages.headers')} ({t('common.optional')})
          </label>
          <textarea
            placeholder={t('messages.headersPlaceholder')}
            value={form.headers}
            onChange={(e) => updateField("headers", e.target.value)}
            className="input w-full font-mono h-20"
          />
          {errors.headers && (
            <p className="text-red-400 text-display-xs mt-1">{errors.headers}</p>
          )}
        </div>

        <div>
          <label className="block text-display-sm font-medium mb-2">{t('messages.payload')}</label>
          <textarea
            placeholder={t('messages.payloadPlaceholder')}
            value={form.payload}
            onChange={(e) => updateField("payload", e.target.value)}
            className="input w-full font-mono h-40"
            required
          />
          {errors.payload && (
            <p className="text-red-400 text-display-xs mt-1">{errors.payload}</p>
          )}
        </div>

        <div className="flex items-center gap-3 pt-4">
          <Button type="submit" variant="primary" icon={<Send className="icon-base" />}>
            {t('messages.publish')}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              onChange({
                subject: "",
                payload: "",
                replyTo: "",
                headers: "{}",
              })
            }
          >
            {t('messages.clear')}
          </Button>
        </div>
      </form>
    </div>
  );
}
