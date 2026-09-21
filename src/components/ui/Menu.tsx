import { useEffect, useRef, useState, type ReactNode } from 'react'

import { cn } from '@/lib/cn'

export interface MenuItem {
  label: string
  onSelect: () => void
  danger?: boolean
}

interface MenuProps {
  trigger: ReactNode
  items: MenuItem[]
  align?: 'left' | 'right'
}

/** Menu suspenso simples (sem dependência): abre no clique, fecha ao clicar fora ou com Esc. */
export function Menu({ trigger, items, align = 'right' }: MenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="relative inline-block" ref={ref}>
      <div onClick={() => setOpen((v) => !v)}>{trigger}</div>
      {open ? (
        <div
          className={cn(
            'absolute z-40 mt-1 min-w-40 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-lg',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                item.onSelect()
                setOpen(false)
              }}
              className={cn(
                'block w-full px-3 py-1.5 text-left text-sm hover:bg-[var(--color-surface-hover)]',
                item.danger ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-primary)]',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
