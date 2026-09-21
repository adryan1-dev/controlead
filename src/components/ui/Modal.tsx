import { useEffect, useRef, type ReactNode } from 'react'

import { X } from 'lucide-react'

import { cn } from '@/lib/cn'

import { IconButton } from './IconButton'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

/** Modal centralizado sobre `<dialog>` nativo (sem dependência extra). Fecha com Esc, clique fora, ou o X. */
export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
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
        // Reforço explícito: em alguns ambientes (ex.: automação via CDP) o
        // fechamento nativo do <dialog> no Esc não dispara de forma confiável.
        if (e.key === 'Escape') {
          e.preventDefault()
          onClose()
        }
      }}
      className={cn(
        'w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-0 shadow-xl backdrop:bg-black/40',
        SIZE_CLASSES[size],
      )}
    >
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-3.5">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)]">{title}</h2>
        <IconButton icon={<X size={16} />} label="Fechar" onClick={onClose} />
      </div>
      <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
      {footer ? (
        <div className="flex justify-end gap-2 border-t border-[var(--color-border)] px-5 py-3.5">{footer}</div>
      ) : null}
    </dialog>
  )
}
