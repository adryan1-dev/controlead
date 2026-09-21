import { Archive } from 'lucide-react'

import { ContactLinks } from '@/components/shared/ContactLinks'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { IconButton } from '@/components/ui/IconButton'
import { Select } from '@/components/ui/Select'
import { Table, type TableColumn } from '@/components/ui/Table'
import { LEAD_PIPELINE_ORDER, LEAD_STATUS_LABELS } from '@/domain/constants'
import type { LeadStatus } from '@/domain/constants'
import { formatDate } from '@/domain/dates'
import type { Lead } from '@/domain/types'
import { changeStatus } from '@/services/leadService'

interface LeadsTableProps {
  leads: Lead[]
  onRowClick: (lead: Lead) => void
  onArchive: (lead: Lead) => void
  onCreateClick: () => void
}

const ALL_STATUSES: LeadStatus[] = [...LEAD_PIPELINE_ORDER, 'not_interested', 'lost']

export function LeadsTable({ leads, onRowClick, onArchive, onCreateClick }: LeadsTableProps) {
  const columns: TableColumn<Lead>[] = [
    {
      key: 'name',
      header: 'Nome',
      render: (lead) => (
        <div className="flex flex-col">
          <span className="font-medium text-[var(--color-text-primary)]">{lead.name}</span>
          {lead.company ? <span className="text-xs text-[var(--color-text-muted)]">{lead.company}</span> : null}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (lead) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Select
            className="h-8 w-40 text-xs"
            value={lead.status}
            onChange={(e) => changeStatus(lead.id, e.target.value as LeadStatus)}
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {LEAD_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>
      ),
    },
    { key: 'niche', header: 'Nicho', render: (lead) => lead.niche ?? '—' },
    { key: 'source', header: 'Origem', render: (lead) => lead.source ?? '—' },
    {
      key: 'tags',
      header: 'Tags',
      render: (lead) =>
        lead.tags.length ? (
          <div className="flex flex-wrap gap-1">
            {lead.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        ) : (
          '—'
        ),
    },
    {
      key: 'createdAt',
      header: 'Cadastro',
      render: (lead) => formatDate(lead.createdAt.slice(0, 10)),
    },
    {
      key: 'contact',
      header: 'Contato',
      render: (lead) => (
        <div onClick={(e) => e.stopPropagation()}>
          <ContactLinks whatsapp={lead.whatsapp} instagram={lead.instagram} website={lead.website} />
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (lead) => (
        <div onClick={(e) => e.stopPropagation()}>
          <IconButton icon={<Archive size={15} />} label="Arquivar lead" onClick={() => onArchive(lead)} />
        </div>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      rows={leads}
      rowKey={(lead) => lead.id}
      onRowClick={onRowClick}
      emptyState={
        <EmptyState
          title="Nenhum lead encontrado"
          description="Ajuste os filtros ou cadastre um novo lead para começar."
          action={
            <Button variant="primary" onClick={onCreateClick}>
              + Novo lead
            </Button>
          }
        />
      }
    />
  )
}
