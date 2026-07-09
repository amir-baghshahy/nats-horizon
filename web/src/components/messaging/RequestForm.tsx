import { useTranslation } from 'react-i18next';
import { Zap, Eye, MessageSquare } from "lucide-react";
import { validateSubject, validateTimeout } from "../../utils/validators";
import { formatTimestamp } from "../../utils/formatters";
import { Button } from "../ui";

export interface RequestForm {
  subject: string;
  payload: string;
  timeout: number;
}

interface RequestFormProps {
  form: RequestForm;
  onChange: (form: RequestForm) => void;
  onSubmit: () => void;
  response?: any;
  errors?: Record<string, string>;
}

export default function RequestForm({
  form,
  onChange,
  onSubmit,
  response,
  errors = {},
}: RequestFormProps) {
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const subjectValidation = validateSubject(form.subject);
    if (!subjectValidation.valid) {
      return;
    }

    const timeoutValidation = validateTimeout(form.timeout);
    if (!timeoutValidation.valid) {
      return;
    }

    onSubmit();
  };

  const updateField = (field: keyof RequestForm, value: string | number) => {
    onChange({ ...form, [field]: value });
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card">
        <h2 className="text-display-xl font-bold mb-6 flex items-center gap-2">
          <Zap className="icon-md" />
          {t('messages.sendRequest')}
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
            <label className="block text-display-sm font-medium mb-2">{t('messages.payload')}</label>
            <textarea
              placeholder={t('messages.payloadPlaceholder')}
              value={form.payload}
              onChange={(e) => updateField("payload", e.target.value)}
              className="input w-full font-mono h-32"
            />
          </div>

          <div>
            <label className="block text-display-sm font-medium mb-2">
              Timeout (ms)
            </label>
            <input
              type="number"
              value={form.timeout}
              onChange={(e) =>
                updateField("timeout", parseInt(e.target.value) || 5000)
              }
              className="input w-full"
              min="100"
              max="60000"
            />
            {errors.timeout && (
              <p className="text-red-400 text-display-xs mt-1">{errors.timeout}</p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" variant="primary" icon={<Zap className="icon-base" />}>
              {t('messages.sendRequest')}
            </Button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2 className="text-display-xl font-bold mb-6 flex items-center gap-2">
          <Eye className="icon-md" />
          {t('messages.response')}
        </h2>

        {response ? (
          <div className="space-y-4">
            {response.error ? (
              <div className="p-4 bg-red-500/20 text-red-400 rounded-lg">
                {response.error}
              </div>
            ) : (
              <>
                <div className="bg-surface-primary/50 rounded-lg p-4">
                  <p className="text-display-xs text-content-tertiary mb-1">{t('messages.subject')}</p>
                  <p className="font-mono text-display-sm">
                    {response.subject || t('common.na')}
                  </p>
                </div>

                <div className="bg-surface-primary/50 rounded-lg p-4">
                  <p className="text-display-xs text-content-tertiary mb-2">{t('common.data')}</p>
                  <pre className="text-display-sm p-3 bg-surface-primary rounded overflow-x-auto">
                    <code className="text-green-400">
                      {response.data || t('messages.noData')}
                    </code>
                  </pre>
                </div>

                {response.data_base64 && (
                  <div className="bg-surface-primary/50 rounded-lg p-4">
                    <p className="text-display-xs text-content-tertiary mb-1">{t('messages.base64')}</p>
                    <p className="font-mono text-display-xs break-all">
                      {response.data_base64}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-primary/50 rounded-lg p-3">
                    <p className="text-display-xs text-content-tertiary">{t('messages.timestamp')}</p>
                    <p className="text-display-sm">
                      {formatTimestamp(response.timestamp || 0)}
                    </p>
                  </div>

                  {response.reply && (
                    <div className="bg-surface-primary/50 rounded-lg p-3">
                      <p className="text-display-xs text-content-tertiary">{t('messages.reply')}</p>
                      <p className="font-mono text-display-sm truncate">
                        {response.reply}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-content-tertiary">
            <MessageSquare className="icon-lg mx-auto mb-4 opacity-50" />
            <p>{t('messages.sendRequestDescription')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
