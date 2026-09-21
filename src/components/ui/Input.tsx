import type { InputHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

export function Input({ invalid, className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-md border bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors placeholder:text-[var(--color-text-muted)]',
        'focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20',
        invalid ? 'border-[var(--color-danger)]' : 'border-[var(--color-border)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}
