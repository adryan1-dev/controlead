import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-[var(--color-border)] px-6 py-12 text-center">
      {icon ? <div className="text-[var(--color-text-muted)]">{icon}</div> : null}
      <p className="text-sm font-medium text-[var(--color-text-primary)]">{title}</p>
      {description ? <p className="max-w-sm text-sm text-[var(--color-text-secondary)]">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}
