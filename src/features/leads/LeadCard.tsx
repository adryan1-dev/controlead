import { MoreVertical } from 'lucide-react'
import { useNavigate } from 'react-router'

import { Badge } from '@/components/ui/Badge'
import { IconButton } from '@/components/ui/IconButton'
import { Menu } from '@/components/ui/Menu'
import { LEAD_STATUS_LABELS, TASK_TYPE_LABELS, type LeadStatus } from '@/domain/constants'
import { formatDate, today } from '@/domain/dates'
import { isFollowUpPending, nextOpenTask } from '@/domain/rules'
import type { Lead, Task } from '@/domain/types'

interface LeadCardProps {
  lead: Lead
  openTasks: Task[]
  moveTargets: LeadStatus[]
  onMove: (status: LeadStatus) => void
}

export function LeadCard({ lead, openTasks, moveTargets, onMove }: LeadCardProps) {
  const navigate = useNavigate()
  const followUpPending = isFollowUpPending(lead, openTasks, today())
  const next = nextOpenTask(openTasks)

  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/plain', lead.id)}
      onClick={() => navigate(`/leads/${lead.id}`)}
      className="cursor-grab rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-2.5 shadow-[0_1px_2px_rgba(24,24,31,0.04)] transition-colors hover:bg-[var(--color-surface-hover)] active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">{lead.name}</p>
          {lead.company ? <p className="truncate text-xs text-[var(--color-text-muted)]">{lead.company}</p> : null}
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <Menu
            trigger={<IconButton icon={<MoreVertical size={14} />} label="Mover para…" />}
            items={moveTargets.map((status) => ({
              label: LEAD_STATUS_LABELS[status],
              onSelect: () => onMove(status),
            }))}
          />
        </div>
      </div>
      {followUpPending || next ? (
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          {followUpPending ? <Badge tone="warning">Follow-up pendente</Badge> : null}
          {next ? (
            <span className="text-xs text-[var(--color-text-muted)]">
              {TASK_TYPE_LABELS[next.type]} · {formatDate(next.dueDate)}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
