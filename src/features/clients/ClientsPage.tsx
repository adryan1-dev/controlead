import { useNavigate } from 'react-router'

import { PageHeader } from '@/components/layout/PageHeader'
import { MoneyText } from '@/components/shared/MoneyText'
import { EmptyState } from '@/components/ui/EmptyState'
import { Table, type TableColumn } from '@/components/ui/Table'
import { useClients, type ClientRow } from '@/hooks/useClients'

export function ClientsPage() {
  const navigate = useNavigate()
  const clients = useClients()

  const columns: TableColumn<ClientRow>[] = [
    {
      key: 'name',
      header: 'Cliente',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-[var(--color-text-primary)]">{row.lead.name}</span>
          {row.lead.company ? <span className="text-xs text-[var(--color-text-muted)]">{row.lead.company}</span> : null}
        </div>
      ),
    },
    { key: 'projects', header: 'Projetos', render: (row) => row.projectCount },
    { key: 'total', header: 'Total', render: (row) => <MoneyText cents={row.totalCents} /> },
    { key: 'received', header: 'Recebido', render: (row) => <MoneyText cents={row.receivedCents} tone="success" /> },
    {
      key: 'balance',
      header: 'Saldo',
      render: (row) => <MoneyText cents={Math.max(row.balanceCents, 0)} tone={row.balanceCents > 0 ? 'danger' : 'muted'} />,
    },
  ]

  return (
    <>
      <PageHeader title="Clientes" />
      <Table
        columns={columns}
        rows={clients}
        rowKey={(row) => row.lead.id}
        onRowClick={(row) => navigate(`/leads/${row.lead.id}`)}
        emptyState={
          <EmptyState
            title="Nenhum cliente ainda"
            description="Clientes aparecem aqui automaticamente assim que você fechar o primeiro negócio com um lead."
          />
        }
      />
    </>
  )
}
