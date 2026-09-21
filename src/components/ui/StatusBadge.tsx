import {
  FINANCE_STATUS_COLOR,
  FINANCE_STATUS_LABELS,
  LEAD_STATUS_COLOR,
  LEAD_STATUS_LABELS,
  PROJECT_STATUS_COLOR,
  PROJECT_STATUS_LABELS,
  type FinanceStatus,
  type LeadStatus,
  type ProjectStatus,
} from '@/domain/constants'

import { Badge } from './Badge'

interface StatusBadgeProps {
  status: LeadStatus | ProjectStatus | FinanceStatus
  kind: 'lead' | 'project' | 'finance'
}

/** Badge de status já resolvendo label e cor a partir das constantes do domínio. */
export function StatusBadge({ status, kind }: StatusBadgeProps) {
  if (kind === 'lead') {
    const s = status as LeadStatus
    return <Badge tone={LEAD_STATUS_COLOR[s]}>{LEAD_STATUS_LABELS[s]}</Badge>
  }
  if (kind === 'project') {
    const s = status as ProjectStatus
    return <Badge tone={PROJECT_STATUS_COLOR[s]}>{PROJECT_STATUS_LABELS[s]}</Badge>
  }
  const s = status as FinanceStatus
  return <Badge tone={FINANCE_STATUS_COLOR[s]}>{FINANCE_STATUS_LABELS[s]}</Badge>
}
