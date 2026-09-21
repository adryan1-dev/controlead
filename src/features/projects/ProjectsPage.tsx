import { useMemo } from 'react'

import { useNavigate } from 'react-router'

import { PageHeader } from '@/components/layout/PageHeader'
import { DueLabel } from '@/components/shared/DueLabel'
import { MoneyText } from '@/components/shared/MoneyText'
import { EmptyState } from '@/components/ui/EmptyState'
import { Select } from '@/components/ui/Select'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Table, type TableColumn } from '@/components/ui/Table'
import {
  FINANCE_STATUS_LABELS,
  FINANCE_STATUSES,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_ORDER,
  type FinanceStatus,
  type ProjectStatus,
} from '@/domain/constants'
import { today } from '@/domain/dates'
import { getProjectFinance } from '@/domain/finance'
import { deadlineState } from '@/domain/rules'
import { useLeads } from '@/hooks/useLeads'
import { useAllProjectItems } from '@/hooks/useProjectItems'
import { useProjects } from '@/hooks/useProjects'
import { useAllPayments } from '@/hooks/usePayments'
import { useSettings } from '@/hooks/useSettings'
import { useUrlFilters } from '@/hooks/useUrlFilters'

interface ProjectsFiltersValue {
  status: string
  finance: string
  deadline: string
  [key: string]: string
}

const DEFAULT_FILTERS: ProjectsFiltersValue = { status: '', finance: '', deadline: '' }

export function ProjectsPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useUrlFilters(DEFAULT_FILTERS)
  const settings = useSettings()

  const projects = useProjects({ status: (filters.status || undefined) as ProjectStatus | undefined })
  const leads = useLeads({ includeArchived: true })
  const itemsByProject = useAllProjectItems()
  const paymentsByProject = useAllPayments()

  const leadNameById = useMemo(() => new Map((leads ?? []).map((l) => [l.id, l.name])), [leads])

  const rows = useMemo(() => {
    return (projects ?? [])
      .map((project) => ({
        project,
        finance: getProjectFinance(itemsByProject.get(project.id) ?? [], paymentsByProject.get(project.id) ?? []),
        deadline: deadlineState(project.dueDate, today(), settings.deadlineWarningDays),
      }))
      .filter(({ finance }) => !filters.finance || finance.status === filters.finance)
      .filter(({ deadline }) => !filters.deadline || deadline === filters.deadline)
  }, [projects, itemsByProject, paymentsByProject, settings.deadlineWarningDays, filters.finance, filters.deadline])

  const columns: TableColumn<(typeof rows)[number]>[] = [
    {
      key: 'service',
      header: 'Projeto',
      render: ({ project }) => (
        <div className="flex flex-col">
          <span className="font-medium text-[var(--color-text-primary)]">{project.service}</span>
          <span className="text-xs text-[var(--color-text-muted)]">{leadNameById.get(project.leadId) ?? '—'}</span>
        </div>
      ),
    },
    { key: 'status', header: 'Status', render: ({ project }) => <StatusBadge kind="project" status={project.status} /> },
    { key: 'deadline', header: 'Prazo', render: ({ project }) => <DueLabel date={project.dueDate} warnDays={settings.deadlineWarningDays} /> },
    { key: 'total', header: 'Total', render: ({ finance }) => <MoneyText cents={finance.totalCents} /> },
    { key: 'received', header: 'Recebido', render: ({ finance }) => <MoneyText cents={finance.receivedCents} tone="success" /> },
    {
      key: 'balance',
      header: 'Restante',
      render: ({ finance }) => <MoneyText cents={Math.max(finance.balanceCents, 0)} tone={finance.balanceCents > 0 ? 'danger' : 'muted'} />,
    },
    { key: 'finance', header: 'Financeiro', render: ({ finance }) => <StatusBadge kind="finance" status={finance.status} /> },
  ]

  return (
    <>
      <PageHeader title="Projetos" />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select className="w-44" value={filters.status} onChange={(e) => setFilters({ status: e.target.value })}>
          <option value="">Todos os status</option>
          {PROJECT_STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {PROJECT_STATUS_LABELS[s]}
            </option>
          ))}
          <option value="cancelled">{PROJECT_STATUS_LABELS.cancelled}</option>
        </Select>
        <Select className="w-40" value={filters.finance} onChange={(e) => setFilters({ finance: e.target.value })}>
          <option value="">Financeiro: todos</option>
          {FINANCE_STATUSES.map((s: FinanceStatus) => (
            <option key={s} value={s}>
              {FINANCE_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
        <Select className="w-40" value={filters.deadline} onChange={(e) => setFilters({ deadline: e.target.value })}>
          <option value="">Prazo: todos</option>
          <option value="overdue">Atrasado</option>
          <option value="soon">Próximo</option>
          <option value="ok">Em dia</option>
        </Select>
      </div>

      <Table
        columns={columns}
        rows={rows}
        rowKey={(r) => r.project.id}
        onRowClick={(r) => navigate(`/projects/${r.project.id}`)}
        emptyState={<EmptyState title="Nenhum projeto encontrado" description="Feche um negócio em Leads para criar o primeiro projeto." />}
      />
    </>
  )
}
