import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { STATUS_TONES } from '../utils/constants'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: number
  type: ToastType
  message: string
}

interface ToastContextValue {
  toast: (type: ToastType, message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let nextId = 0

const ICONS: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const COLORS: Record<ToastType, string> = {
  success: `border-green-500/50 bg-green-500/10 ${STATUS_TONES.success.text}`,
  error: `border-red-500/50 bg-red-500/10 ${STATUS_TONES.error.text}`,
  warning: `border-yellow-500/50 bg-yellow-500/10 ${STATUS_TONES.warning.text}`,
  info: `border-blue-500/50 bg-blue-500/10 ${STATUS_TONES.info.text}`,
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = nextId++
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t, index) => {
          const Icon = ICONS[t.type]
          const delayStyle = index > 0 ? { animationDelay: `${Math.min(index * 100, 500)}ms` } : undefined
          return (
            <div
              key={t.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-lg shadow-lg animate-slide-right animate-duration-200 hover-lift pointer-events-auto ${COLORS[t.type]}`}
              style={delayStyle}
            >
              <Icon className="icon-md flex-shrink-0 animate-bounce-in" />
              <span className="text-display-sm flex-1">{t.message}</span>
              <button
                onClick={() => removeToast(t.id)}
                className="icon-btn opacity-60 hover:opacity-100 active:scale-95"
              >
                <X className="icon-base" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
