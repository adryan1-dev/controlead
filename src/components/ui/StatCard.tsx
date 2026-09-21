import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

export type StatCardChip = 'blue' | 'violet' | 'teal' | 'amber' | 'rose'

interface StatCardProps {
  label: string
  value: ReactNode
  onClick?: () => void
  tone?: 'neutral' | 'warning' | 'danger'
  /** Ícone opcional dentro de um chip colorido, para variedade visual no grid de KPIs. */
  icon?: ReactNode
  chip?: StatCardChip
}

const CHIP_CLASSES: Record<StatCardChip, string> = {
  blue: 'bg-[var(--color-chip-blue-bg)] text-[var(--color-chip-blue)]',
  violet: 'bg-[var(--color-chip-violet-bg)] text-[var(--color-chip-violet)]',
  teal: 'bg-[var(--color-chip-teal-bg)] text-[var(--color-chip-teal)]',
  amber: 'bg-[var(--color-chip-amber-bg)] text-[var(--color-chip-amber)]',
  rose: 'bg-[var(--color-chip-rose-bg)] text-[var(--color-chip-rose)]',
}

/** KPI compacto do Dashboard. Clicável quando `onClick` é informado. */
export function StatCard({ label, value, onClick, tone = 'neutral', icon, chip = 'blue' }: StatCardProps) {
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp
      onClick={onClick}
      className={cn(
        'flex items-start justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-left shadow-[0_1px_2px_rgba(24,24,31,0.04)] transition-colors',
        onClick && 'cursor-pointer hover:bg-[var(--color-surface-hover)]',
      )}
    >
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-[var(--color-text-secondary)]">{label}</span>
        <span
          className={cn(
            'text-xl font-semibold',
            tone === 'danger' && 'text-[var(--color-danger)]',
            tone === 'warning' && 'text-[var(--color-warning)]',
            tone === 'neutral' && 'text-[var(--color-text-primary)]',
          )}
        >
          {value}
        </span>
      </div>
      {icon ? (
        <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', CHIP_CLASSES[chip])}>
          {icon}
        </span>
      ) : null}
    </Comp>
  )
}
