import { formatDate, today } from '@/domain/dates'
import { deadlineState } from '@/domain/rules'
import type { DateString } from '@/domain/types'

import { Badge } from '../ui/Badge'

interface DueLabelProps {
  date: DateString | undefined
  warnDays?: number
}

/** Badge de prazo (atrasado/próximo/ok), calculado a partir de `domain/rules.deadlineState`. */
export function DueLabel({ date, warnDays = 3 }: DueLabelProps) {
  if (!date) return <span className="text-sm text-[var(--color-text-muted)]">Sem prazo</span>

  const state = deadlineState(date, today(), warnDays)
  const label = formatDate(date)

  if (state === 'overdue') return <Badge tone="danger">Atrasado · {label}</Badge>
  if (state === 'soon') return <Badge tone="warning">Próximo · {label}</Badge>
  return <Badge tone="neutral">{label}</Badge>
}
