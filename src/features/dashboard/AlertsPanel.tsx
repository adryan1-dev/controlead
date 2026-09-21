import { useNavigate } from 'react-router'

import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { daysStale } from '@/domain/rules'
import { today } from '@/domain/dates'
import type { DashboardData } from '@/hooks/useDashboard'

interface AlertsPanelProps {
  data: DashboardData
}

interface AlertRowProps {
  label: string
  sublabel?: string
  tone: 'danger' | 'warning'
  onClick: () => void
}

function AlertRow({ label, sublabel, tone, onClick }: AlertRowProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-[var(--color-surface-hover)]"
    >
      <span className="min-w-0 truncate text-[var(--color-text-primary)]">{label}</span>
      {sublabel ? <Badge tone={tone}>{sublabel}</Badge> : null}
    </button>
  )
}

/** Projetos atrasados/perto do prazo, leads parados, e projetos entregues com saldo em aberto. */
export function AlertsPanel({ data }: AlertsPanelProps) {
  const navigate = useNavigate()
  const todayStr = today()

  const hasAny =
    data.overdueProjects.length + data.soonProjects.length + data.staleLeads.length + data.deliveredWithBalance.length > 0

  return (
    <Card className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Alertas</h2>

      {!hasAny ? (
        <EmptyState title="Nada precisando de atenção" description="Prazos, leads e pagamentos estão em dia." />
      ) : (
        <div className="flex flex-col gap-1">
          {data.overdueProjects.map((p) => (
            <AlertRow
              key={p.id}
              label={p.service}
              sublabel="Atrasado"
              tone="danger"
              onClick={() => navigate(`/projects/${p.id}`)}
            />
          ))}
          {data.soonProjects.map((p) => (
            <AlertRow
              key={p.id}
              label={p.service}
              sublabel="Prazo próximo"
              tone="warning"
              onClick={() => navigate(`/projects/${p.id}`)}
            />
          ))}
          {data.staleLeads.map((lead) => (
            <AlertRow
              key={lead.id}
              label={lead.name}
              sublabel={`Parado há ${daysStale(lead, todayStr)}d`}
              tone="warning"
              onClick={() => navigate(`/leads/${lead.id}`)}
            />
          ))}
          {data.deliveredWithBalance.map((p) => (
            <AlertRow
              key={p.id}
              label={p.service}
              sublabel="Saldo em aberto"
              tone="warning"
              onClick={() => navigate(`/projects/${p.id}`)}
            />
          ))}
        </div>
      )}
    </Card>
  )
}
