import { useMemo, useState } from 'react'

import { ChevronDown, ChevronRight } from 'lucide-react'

import { useToast } from '@/components/ui/Toast'
import { LEAD_FINAL_STATUSES, LEAD_PIPELINE_ORDER, type LeadStatus } from '@/domain/constants'
import { addDays, formatDate, today } from '@/domain/dates'
import type { Lead, Task } from '@/domain/types'
import { useOpenTasks } from '@/hooks/useOpenTasks'
import { useSettings } from '@/hooks/useSettings'
import { changeStatus } from '@/services/leadService'

import { KanbanColumn } from './KanbanColumn'

interface KanbanBoardProps {
  leads: Lead[]
  /** Soltar/mover um card para "Fechado" nunca muda o status diretamente: abre o modal de fechamento (etapa 10). */
  onRequestCloseDeal: (lead: Lead) => void
}

const KANBAN_STATUSES: LeadStatus[] = LEAD_PIPELINE_ORDER
const FINAL_STATUSES: LeadStatus[] = [...LEAD_FINAL_STATUSES.filter((s) => s !== 'closed')]

export function KanbanBoard({ leads, onRequestCloseDeal }: KanbanBoardProps) {
  const openTasks = useOpenTasks() ?? []
  const settings = useSettings()
  const { showToast } = useToast()
  const [showFinal, setShowFinal] = useState(false)

  const tasksByLead = useMemo(() => {
    const map = new Map<string, Task[]>()
    for (const t of openTasks) {
      const arr = map.get(t.leadId)
      if (arr) arr.push(t)
      else map.set(t.leadId, [t])
    }
    return map
  }, [openTasks])

  function moveTargets(current: LeadStatus): LeadStatus[] {
    return [...KANBAN_STATUSES, ...FINAL_STATUSES].filter((s) => s !== current)
  }

  async function handleMoveLead(leadId: string, status: LeadStatus) {
    const lead = leads.find((l) => l.id === leadId)
    if (!lead || lead.status === status) return

    if (status === 'closed') {
      onRequestCloseDeal(lead)
      return
    }

    await changeStatus(leadId, status)

    const followUpDays = settings.followUpDays[status]
    if (followUpDays) {
      const suggestedDate = formatDate(addDays(today(), followUpDays))
      showToast(`${lead.name} movido. Sugestão: follow-up para ${suggestedDate} — abra o lead para confirmar.`, 'info')
    } else {
      showToast(`${lead.name} movido`)
    }
  }

  const visibleStatuses = showFinal ? [...KANBAN_STATUSES, ...FINAL_STATUSES] : KANBAN_STATUSES

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3 overflow-x-auto pb-2">
        {visibleStatuses.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            leads={leads.filter((l) => l.status === status)}
            tasksByLead={tasksByLead}
            moveTargets={moveTargets}
            onMoveLead={handleMoveLead}
          />
        ))}
      </div>
      <button
        onClick={() => setShowFinal((v) => !v)}
        className="flex w-fit items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
      >
        {showFinal ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        Não interessado / Perdido
      </button>
    </div>
  )
}
