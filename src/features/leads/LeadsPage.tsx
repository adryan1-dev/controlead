import { useEffect, useMemo, useState } from 'react'

import { LayoutGrid, Plus, Table2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'

import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toast'
import type { LeadStatus } from '@/domain/constants'
import { today } from '@/domain/dates'
import { isFollowUpPending, isStale } from '@/domain/rules'
import type { Lead } from '@/domain/types'
import { cn } from '@/lib/cn'
import { useLead } from '@/hooks/useLead'
import { useLeads } from '@/hooks/useLeads'
import { useOpenTasks } from '@/hooks/useOpenTasks'
import { useSettings } from '@/hooks/useSettings'
import { useUrlFilters } from '@/hooks/useUrlFilters'
import { archiveLead } from '@/services/leadService'

import { CloseDealModal } from '../deals/CloseDealModal'
import { KanbanBoard } from './KanbanBoard'
import { LeadDrawer } from './LeadDrawer'
import { LeadFilters, type LeadFiltersValue } from './LeadFilters'
import { LeadForm } from './LeadForm'
import { LeadsTable } from './LeadsTable'

const DEFAULT_FILTERS: LeadFiltersValue = {
  status: '',
  niche: '',
  source: '',
  search: '',
  tag: '',
  createdFrom: '',
  createdTo: '',
  view: 'table',
  followup: '',
  stale: '',
}

export function LeadsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const openLead = useLead(id)

  const [filters, setFilters] = useUrlFilters(DEFAULT_FILTERS)
  const leadsRaw = useLeads({
    status: (filters.status || undefined) as LeadStatus | undefined,
    niche: filters.niche || undefined,
    source: filters.source || undefined,
    search: filters.search || undefined,
    tag: filters.tag || undefined,
    createdFrom: filters.createdFrom || undefined,
    createdTo: filters.createdTo || undefined,
  })
  const { showToast } = useToast()

  const openTasks = useOpenTasks() ?? []
  const settings = useSettings()
  const leads = useMemo(() => {
    if (!leadsRaw) return leadsRaw
    if (!filters.followup && !filters.stale) return leadsRaw
    const todayStr = today()
    return leadsRaw.filter((lead) => {
      const leadTasks = openTasks.filter((t) => t.leadId === lead.id)
      if (filters.followup && !isFollowUpPending(lead, leadTasks, todayStr)) return false
      if (filters.stale && !isStale(lead, leadTasks, todayStr, settings.staleDays)) return false
      return true
    })
  }, [leadsRaw, openTasks, filters.followup, filters.stale, settings.staleDays])

  const [formOpen, setFormOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | undefined>(undefined)
  const [archiveTarget, setArchiveTarget] = useState<Lead | undefined>(undefined)
  const [dealTarget, setDealTarget] = useState<Lead | undefined>(undefined)

  function openCreate() {
    setEditingLead(undefined)
    setFormOpen(true)
  }

  function openEdit(lead: Lead) {
    setEditingLead(lead)
    setFormOpen(true)
  }

  // Atalho "N": novo lead, exceto enquanto o usuário digita em um campo ou algum diálogo já está aberto.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key.toLowerCase() !== 'n' || e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
      if (document.querySelector('dialog[open]')) return
      e.preventDefault()
      openCreate()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <>
      <PageHeader
        title="Leads"
        actions={
          <>
            <div className="flex items-center gap-0.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-0.5">
              <button
                aria-label="Ver em tabela"
                title="Tabela"
                onClick={() => setFilters({ view: 'table' })}
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded',
                  filters.view !== 'kanban'
                    ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]',
                )}
              >
                <Table2 size={14} />
              </button>
              <button
                aria-label="Ver em Kanban"
                title="Kanban"
                onClick={() => setFilters({ view: 'kanban' })}
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded',
                  filters.view === 'kanban'
                    ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]',
                )}
              >
                <LayoutGrid size={14} />
              </button>
            </div>
            <Button variant="primary" icon={<Plus size={16} />} onClick={openCreate}>
              Novo lead
            </Button>
          </>
        }
      />

      <LeadFilters value={filters} onChange={setFilters} />

      {filters.view === 'kanban' ? (
        <KanbanBoard leads={leads ?? []} onRequestCloseDeal={setDealTarget} />
      ) : (
        <LeadsTable
          leads={leads ?? []}
          onRowClick={(lead) => navigate(`/leads/${lead.id}`)}
          onArchive={(lead) => setArchiveTarget(lead)}
          onCreateClick={openCreate}
        />
      )}

      {openLead ? (
        <LeadDrawer
          lead={openLead}
          open
          onClose={() => navigate('/leads')}
          onEdit={() => openEdit(openLead)}
          onCloseDeal={() => setDealTarget(openLead)}
        />
      ) : null}

      <LeadForm open={formOpen} onClose={() => setFormOpen(false)} lead={editingLead} />

      <CloseDealModal lead={dealTarget} onClose={() => setDealTarget(undefined)} />

      <ConfirmDialog
        open={!!archiveTarget}
        onCancel={() => setArchiveTarget(undefined)}
        onConfirm={async () => {
          if (!archiveTarget) return
          await archiveLead(archiveTarget.id)
          showToast(`${archiveTarget.name} arquivado`)
          setArchiveTarget(undefined)
        }}
        title="Arquivar lead?"
        description={`"${archiveTarget?.name}" sai das listagens padrão, mas o histórico é preservado.`}
        confirmLabel="Arquivar"
      />
    </>
  )
}
