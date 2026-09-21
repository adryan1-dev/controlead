import { useState } from 'react'

import { cn } from '@/lib/cn'
import { LEAD_STATUS_LABELS, type LeadStatus } from '@/domain/constants'
import type { Lead, Task } from '@/domain/types'

import { LeadCard } from './LeadCard'

interface KanbanColumnProps {
  status: LeadStatus
  leads: Lead[]
  tasksByLead: Map<string, Task[]>
  moveTargets: (current: LeadStatus) => LeadStatus[]
  onMoveLead: (leadId: string, status: LeadStatus) => void
}

export function KanbanColumn({ status, leads, tasksByLead, moveTargets, onMoveLead }: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false)

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setIsOver(true)
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsOver(false)
        const leadId = e.dataTransfer.getData('text/plain')
        if (leadId) onMoveLead(leadId, status)
      }}
      className={cn(
        'flex w-64 shrink-0 flex-col gap-2 rounded-lg border p-2 transition-colors',
        isOver ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]' : 'border-[var(--color-border)] bg-[var(--color-bg)]',
      )}
    >
      <div className="flex items-center justify-between px-1 py-0.5">
        <span className="text-xs font-semibold text-[var(--color-text-secondary)]">{LEAD_STATUS_LABELS[status]}</span>
        <span className="text-xs text-[var(--color-text-muted)]">{leads.length}</span>
      </div>
      <div className="flex flex-col gap-2">
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            openTasks={tasksByLead.get(lead.id) ?? []}
            moveTargets={moveTargets(status)}
            onMove={(target) => onMoveLead(lead.id, target)}
          />
        ))}
      </div>
    </div>
  )
}
