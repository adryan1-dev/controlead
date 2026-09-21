import { formatCents } from '@/domain/money'
import { cn } from '@/lib/cn'

interface MoneyTextProps {
  cents: number
  tone?: 'default' | 'success' | 'danger' | 'muted'
  className?: string
}

export function MoneyText({ cents, tone = 'default', className }: MoneyTextProps) {
  return (
    <span
      className={cn(
        'tabular-nums',
        tone === 'success' && 'text-[var(--color-success)]',
        tone === 'danger' && 'text-[var(--color-danger)]',
        tone === 'muted' && 'text-[var(--color-text-muted)]',
        tone === 'default' && 'text-[var(--color-text-primary)]',
        className,
      )}
    >
      {formatCents(cents)}
    </span>
  )
}
