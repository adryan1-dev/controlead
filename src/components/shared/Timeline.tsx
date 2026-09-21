import { ArrowRightLeft, Banknote, CheckCircle2, Handshake, MessageSquare, Package, Trash2, UserPlus } from 'lucide-react'
import type { ReactNode } from 'react'

import { EVENT_TYPE_LABELS, type EventType } from '@/domain/constants'
import type { Event } from '@/domain/types'

const EVENT_ICON: Record<EventType, ReactNode> = {
  lead_created: <UserPlus size={14} />,
  status_changed: <ArrowRightLeft size={14} />,
  note: <MessageSquare size={14} />,
  contact: <MessageSquare size={14} />,
  task_completed: <CheckCircle2 size={14} />,
  deal_closed: <Handshake size={14} />,
  project_status_changed: <ArrowRightLeft size={14} />,
  payment_added: <Banknote size={14} />,
  payment_removed: <Banknote size={14} />,
  item_added: <Package size={14} />,
  project_deleted: <Trash2 size={14} />,
}

const TIMESTAMP_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

interface TimelineProps {
  events: Event[]
}

/** Histórico cronológico (mais recente primeiro) de um lead ou projeto. */
export function Timeline({ events }: TimelineProps) {
  const sorted = [...events].sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))

  if (sorted.length === 0) {
    return <p className="text-sm text-[var(--color-text-muted)]">Sem eventos registrados ainda.</p>
  }

  return (
    <ol className="flex flex-col gap-3">
      {sorted.map((event) => (
        <li key={event.id} className="flex gap-2.5">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]">
            {EVENT_ICON[event.type]}
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                {EVENT_TYPE_LABELS[event.type]}
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">
                {TIMESTAMP_FORMATTER.format(new Date(event.at))}
              </span>
            </div>
            {event.text ? <p className="text-sm text-[var(--color-text-secondary)]">{event.text}</p> : null}
            {event.data?.from && event.data?.to ? (
              <p className="text-sm text-[var(--color-text-secondary)]">
                {event.data.from} → {event.data.to}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  )
}
