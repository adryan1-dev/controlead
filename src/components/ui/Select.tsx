import type { SelectHTMLAttributes } from 'react'

import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/cn'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean
}

export function Select({ invalid, className, children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          'h-10 w-full appearance-none rounded-md border bg-[var(--color-surface)] px-3 pr-8 text-sm text-[var(--color-text-primary)] outline-none transition-colors',
          'focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20',
          invalid ? 'border-[var(--color-danger)]' : 'border-[var(--color-border)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
      />
    </div>
  )
}
