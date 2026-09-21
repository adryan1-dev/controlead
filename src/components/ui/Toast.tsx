import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

import { CheckCircle2, XCircle, X } from 'lucide-react'

import { cn } from '@/lib/cn'

type ToastTone = 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  tone: ToastTone
  message: string
}

interface ToastContextValue {
  showToast: (message: string, tone?: ToastTone) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const TONE_ICON: Record<ToastTone, ReactNode> = {
  success: <CheckCircle2 size={16} className="text-[var(--color-success)]" />,
  error: <XCircle size={16} className="text-[var(--color-danger)]" />,
  info: <CheckCircle2 size={16} className="text-[var(--color-info)]" />,
}

/** Provider raiz que renderiza a pilha de toasts. Use `useToast()` para disparar. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((message: string, tone: ToastTone = 'success') => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, tone }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm shadow-lg',
            )}
          >
            {TONE_ICON[toast.tone]}
            <span className="text-[var(--color-text-primary)]">{toast.message}</span>
            <button
              aria-label="Fechar"
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="ml-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast precisa estar dentro de <ToastProvider>')
  return ctx
}
