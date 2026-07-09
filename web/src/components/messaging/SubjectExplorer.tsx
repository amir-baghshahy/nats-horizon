import { useTranslation } from 'react-i18next';
import { Globe } from "lucide-react";

interface SubjectExplorerProps {
  subjects: string[];
}

export default function SubjectExplorer({ subjects }: SubjectExplorerProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary-500/20 p-3">
            <Globe className="h-5 w-5 text-primary-400" />
          </div>
          <div>
            <h2 className="text-display-xl font-bold">{t('messages.subjects')}</h2>
            <p className="mt-2 text-display-sm leading-6 text-content-tertiary">
              {t('messages.subjectsDescription')}
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl bg-surface-primary/50 p-4">
                <p className="text-display-sm font-medium">{t('messages.subscribe')}</p>
                <p className="mt-1 text-display-xs text-content-tertiary">
                  {t('messages.subscribeDescription')}
                </p>
              </div>
              <div className="rounded-xl bg-surface-primary/50 p-4">
                <p className="text-display-sm font-medium">{t('messages.publish')}</p>
                <p className="mt-1 text-display-xs text-content-tertiary">
                  {t('messages.publishDescription')}
                </p>
              </div>
              <div className="rounded-xl bg-surface-primary/50 p-4">
                <p className="text-display-sm font-medium">{t('messages.requestReply')}</p>
                <p className="mt-1 text-display-xs text-content-tertiary">
                  {t('messages.requestReplyDescription')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="mb-4 text-display-lg font-semibold">{t('messages.knownSubjects')}</h3>
        {subjects.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {subjects.map((subject) => (
              <span
                key={subject}
                className="rounded-xl border border-border-default/70 bg-surface-primary/50 px-3 py-2 font-mono text-display-sm text-primary-300"
              >
                {subject}
              </span>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border-default bg-surface-primary/30 p-8 text-center text-content-tertiary">
            <Globe className="mx-auto mb-3 h-10 w-10 opacity-50" />
            <p>{t('messages.noSubjectsDiscovered')}</p>
            <p className="mt-1 text-display-sm">
              {t('messages.noSubjectsDiscoveredDescription')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
