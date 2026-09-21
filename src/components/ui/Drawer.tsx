import { useEffect, useRef, type ReactNode } from 'react'

import { X } from 'lucide-react'

import { cn } from '@/lib/cn'

import { IconButton } from './IconButton'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  widthClassName?: string
}

/** Painel lateral (direita) sobre `<dialog>` nativo, mantendo o contexto de fundo visível. */
export function Drawer({ open, onClose, title, children, footer, widthClassName = 'max-w-lg' }: DrawerProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault()
          onClose()
        }
      }}
      className={cn(
        // `hidden open:flex` (em vez de `flex` incondicional) porque uma classe de
        // autor com `display` sempre vence o `dialog:not([open]){display:none}` do
        // user-agent stylesheet — se não fizermos isso, o drawer fica sempre visível.
        'fixed inset-y-0 right-0 m-0 hidden h-dvh max-h-dvh w-full open:flex flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)] p-0 shadow-xl backdrop:bg-black/40',
        widthClassName,
      )}
    >
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-3.5">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)]">{title}</h2>
        <IconButton icon={<X size={16} />} label="Fechar" onClick={onClose} />
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
      {footer ? (
        <div className="flex justify-end gap-2 border-t border-[var(--color-border)] px-5 py-3.5">{footer}</div>
      ) : null}
    </dialog>
  )
}
