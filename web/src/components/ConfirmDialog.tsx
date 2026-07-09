import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { AlertTriangle, Trash2, Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ModalWrapper } from './ui/Modal'
import { Button } from './ui'

type Variant = 'danger' | 'warning' | 'info'

interface ConfirmOptions {
  title: string
  message: string
  confirmLabel?: string
  variant?: Variant
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

interface DialogState extends ConfirmOptions {
  resolve: (value: boolean) => void
}

const VARIANT_STYLES: Record<Variant, { icon: typeof Trash2; iconBg: string; iconColor: string; btn: string }> = {
  danger:  { icon: Trash2,        iconBg: 'bg-red-500/15',    iconColor: 'text-red-400',    btn: 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20' },
  warning: { icon: AlertTriangle, iconBg: 'bg-yellow-500/15', iconColor: 'text-yellow-400', btn: 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-lg shadow-yellow-500/20' },
  info:    { icon: Info,          iconBg: 'bg-primary-500/15',iconColor: 'text-primary-400', btn: 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/20' },
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null)
  const { t } = useTranslation();

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialog({ ...options, resolve })
    })
  }, [])

  const handleClose = (value: boolean) => {
    dialog?.resolve(value)
    setDialog(null)
  }

  const variant = dialog?.variant ?? 'danger'
  const styles = VARIANT_STYLES[variant]
  const Icon = styles.icon

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {dialog && (
        <ModalWrapper isOpen={true}>
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => handleClose(false)}
          >
          <div
            className="card w-full max-w-md animate-scale-in animate-duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${styles.iconBg} animate-bounce-in`}>
                <Icon className={`icon-md ${styles.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-display-base font-semibold mb-1 animate-fade-in">{dialog.title}</h3>
                <p className="text-display-sm text-content-tertiary animate-fade-in-down animate-delay-100">{dialog.message}</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button
                onClick={() => handleClose(false)}
                variant="secondary"
                autoFocus
              >
                {t('common.cancel')}
              </Button>
              <button
                onClick={() => handleClose(true)}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-display-sm font-semibold active-scale hover-scale focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-primary ${styles.btn}`}
              >
                {dialog.confirmLabel ?? t('common.confirm')}
              </button>
            </div>
          </div>
        </div>
        </ModalWrapper>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider')
  return ctx
}
