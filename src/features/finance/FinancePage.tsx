import { useNavigate } from 'react-router'

import { PageHeader } from '@/components/layout/PageHeader'
import { MoneyText } from '@/components/shared/MoneyText'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatCard } from '@/components/ui/StatCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Table, type TableColumn } from '@/components/ui/Table'
import { currentMonthKey } from '@/domain/dates'
import { useFinance, type FinanceRow } from '@/hooks/useFinance'
import { useUrlFilters } from '@/hooks/useUrlFilters'

interface FinanceFiltersValue {
  month: string
  [key: string]: string
}

export function FinancePage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useUrlFilters<FinanceFiltersValue>({ month: currentMonthKey() })
  const monthKey = filters.month || currentMonthKey()
  const finance = useFinance(monthKey)

  const columns: TableColumn<FinanceRow>[] = [
    { key: 'client', header: 'Cliente', render: (r) => r.leadName },
    { key: 'project', header: 'Projeto', render: (r) => r.project.service },
    { key: 'total', header: 'Total', render: (r) => <MoneyText cents={r.totalCents} /> },
    { key: 'received', header: 'Recebido', render: (r) => <MoneyText cents={r.receivedCents} tone="success" /> },
    {
      key: 'balance',
      header: 'Restante',
      render: (r) => <MoneyText cents={Math.max(r.balanceCents, 0)} tone={r.balanceCents > 0 ? 'danger' : 'muted'} />,
    },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge kind="finance" status={r.status} /> },
  ]

  return (
    <>
      <PageHeader
        title="Financeiro"
        actions={
          <input
            type="month"
            value={monthKey}
            onChange={(e) => setFilters({ month: e.target.value })}
            className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
          />
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Vendido no mês" value={<MoneyText cents={finance.soldCents} />} />
        <StatCard label="Recebido no mês" value={<MoneyText cents={finance.receivedCents} tone="success" />} />
        <StatCard label="A receber" value={<MoneyText cents={finance.receivableCents} />} tone={finance.receivableCents > 0 ? 'warning' : 'neutral'} />
        <StatCard label="Pagamento pendente" value={finance.pendingCount} tone={finance.pendingCount > 0 ? 'warning' : 'neutral'} />
      </div>

      <Table
        columns={columns}
        rows={finance.rows}
        rowKey={(r) => r.project.id}
        onRowClick={(r) => navigate(`/projects/${r.project.id}`)}
        emptyState={<EmptyState title="Nenhum projeto ainda" description="Feche um negócio em Leads para ver os números aqui." />}
      />
    </>
  )
}
