import { useState } from 'react'

import { ArrowDown, ArrowUp, MapPin, Pencil, Plus, RotateCcw, Search, Star, Trash2, Users } from 'lucide-react'
import { useNavigate } from 'react-router'

import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { IconButton } from '@/components/ui/IconButton'
import { Input } from '@/components/ui/Input'
import { StatCard } from '@/components/ui/StatCard'
import { Table, type TableColumn } from '@/components/ui/Table'
import { Tabs } from '@/components/ui/Tabs'
import { useToast } from '@/components/ui/Toast'
import { LEAD_PRIORITY_LABELS, LEAD_STATUS_LABELS, type LeadStatus, type ScriptKind } from '@/domain/constants'
import { SCRIPT_STAGES } from '@/domain/scripts'
import { matchesAny } from '@/domain/search'
import type { Script } from '@/domain/types'
import { useAllCompetitors, useProspectingSummary, useScripts, type CompetitorRow } from '@/hooks/useProspecting'
import { useUrlFilters } from '@/hooks/useUrlFilters'
import { deleteScript, moveScript, restoreDefaultScripts } from '@/services/scriptService'

import { ScriptEditor } from './ScriptEditor'
import { ScriptText } from './ScriptText'

const TABS = [
  { value: 'scripts', label: 'Scripts por etapa' },
  { value: 'objections', label: 'Objeções' },
  { value: 'competitors', label: 'Concorrência' },
  { value: 'summary', label: 'Resumo' },
]

type EditorState = { kind: ScriptKind; script?: Script; stage?: LeadStatus } | undefined

export function ProspectingPage() {
  const [{ tab }, setFilters] = useUrlFilters({ tab: 'scripts' })
  const [editor, setEditor] = useState<EditorState>(undefined)
  const [confirmRestore, setConfirmRestore] = useState(false)
  const { showToast } = useToast()

  return (
    <>
      <PageHeader
        title="Prospecção"
        actions={
          tab === 'scripts' || tab === 'objections' ? (
            <Button variant="ghost" size="sm" icon={<RotateCcw size={14} />} onClick={() => setConfirmRestore(true)}>
              Restaurar modelos
            </Button>
          ) : null
        }
      />

      <div className="mb-5">
        <Tabs items={TABS} value={tab} onChange={(v) => setFilters({ tab: v })} />
      </div>

      {tab === 'scripts' ? <StageScripts onEdit={setEditor} /> : null}
      {tab === 'objections' ? <Objections onEdit={setEditor} /> : null}
      {tab === 'competitors' ? <Competitors /> : null}
      {tab === 'summary' ? <Summary /> : null}

      <ScriptEditor
        open={!!editor}
        onClose={() => setEditor(undefined)}
        kind={editor?.kind ?? 'stage'}
        script={editor?.script}
        defaultStage={editor?.stage}
      />
      <ConfirmDialog
        open={confirmRestore}
        onCancel={() => setConfirmRestore(false)}
        onConfirm={async () => {
          await restoreDefaultScripts()
          setConfirmRestore(false)
          showToast('Modelos restaurados')
        }}
        title="Restaurar modelos?"
        description="Os scripts e objeções que vieram com o app voltam ao texto original (inclusive os que você apagou). Os que você criou não mudam."
        confirmLabel="Restaurar"
      />
    </>
  )
}

// ---------------------------------------------------------------------------
// Scripts por etapa
// ---------------------------------------------------------------------------

function StageScripts({ onEdit }: { onEdit: (state: EditorState) => void }) {
  const scripts = useScripts('stage')

  return (
    <div className="flex flex-col gap-6">
      {SCRIPT_STAGES.map((stage) => {
        const group = (scripts ?? []).filter((s) => s.stage === stage)
        return (
          <section key={stage} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
                {LEAD_STATUS_LABELS[stage]}
                <span className="text-xs font-normal text-[var(--color-text-muted)]">{group.length}</span>
              </h2>
              <Button variant="ghost" size="sm" icon={<Plus size={14} />} onClick={() => onEdit({ kind: 'stage', stage })}>
                Script
              </Button>
            </div>
            {group.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)]">Nenhum script para esta etapa.</p>
            ) : (
              <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                {group.map((script, i) => (
                  <ScriptCard
                    key={script.id}
                    script={script}
                    isFirst={i === 0}
                    isLast={i === group.length - 1}
                    onEdit={() => onEdit({ kind: 'stage', script })}
                  />
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

function ScriptCard({
  script,
  isFirst,
  isLast,
  onEdit,
  quoted,
}: {
  script: Script
  isFirst: boolean
  isLast: boolean
  onEdit: () => void
  quoted?: boolean
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium text-[var(--color-text-primary)]">{quoted ? `“${script.title}”` : script.title}</h3>
        <div className="-mr-1 -mt-1 flex shrink-0">
          <IconButton icon={<ArrowUp size={14} />} label="Subir" disabled={isFirst} onClick={() => moveScript(script.id, -1)} />
          <IconButton icon={<ArrowDown size={14} />} label="Descer" disabled={isLast} onClick={() => moveScript(script.id, 1)} />
          <IconButton icon={<Pencil size={14} />} label="Editar" onClick={onEdit} />
          <IconButton icon={<Trash2 size={14} />} label="Excluir" onClick={() => setConfirmDelete(true)} />
        </div>
      </div>
      <ScriptText mode="template" text={script.body} />
      <ConfirmDialog
        open={confirmDelete}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          await deleteScript(script.id)
          setConfirmDelete(false)
        }}
        title="Excluir script?"
        description={`"${script.title}" será excluído. Se for um modelo do app, dá para trazer de volta em "Restaurar modelos".`}
        confirmLabel="Excluir"
        danger
      />
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Objeções
// ---------------------------------------------------------------------------

function Objections({ onEdit }: { onEdit: (state: EditorState) => void }) {
  const scripts = useScripts('objection')
  const [search, setSearch] = useState('')
  const visible = (scripts ?? []).filter((s) => !search || matchesAny([s.title, s.body], search))

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="relative w-full max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <Input className="pl-8" placeholder="Buscar objeção…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => onEdit({ kind: 'objection' })}>
          Objeção
        </Button>
      </div>
      {visible.length === 0 ? (
        <EmptyState
          title={search ? 'Nenhuma objeção encontrada' : 'Nenhuma objeção cadastrada'}
          description="Cadastre as objeções que você mais ouve e uma resposta pronta para cada uma."
        />
      ) : (
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
          {visible.map((script, i) => (
            <ScriptCard
              key={script.id}
              script={script}
              quoted
              isFirst={search !== '' || i === 0}
              isLast={search !== '' || i === visible.length - 1}
              onEdit={() => onEdit({ kind: 'objection', script })}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Concorrência
// ---------------------------------------------------------------------------

function Competitors() {
  const rows = useAllCompetitors()
  const navigate = useNavigate()

  const columns: TableColumn<CompetitorRow>[] = [
    {
      key: 'lead',
      header: 'Lead',
      render: ({ lead }) => (
        <div className="flex flex-col">
          <span className="font-medium text-[var(--color-text-primary)]">{lead?.name ?? '—'}</span>
          {lead?.city ? <span className="text-xs text-[var(--color-text-muted)]">{lead.city}</span> : null}
        </div>
      ),
    },
    {
      key: 'competitor',
      header: 'Concorrente',
      render: ({ competitor }) => (
        <div className="flex flex-col">
          <span className="text-[var(--color-text-primary)]">{competitor.name}</span>
          {competitor.website ? <span className="text-xs text-[var(--color-text-muted)]">{competitor.website}</span> : null}
        </div>
      ),
    },
    { key: 'offers', header: 'O que oferece', render: ({ competitor }) => competitor.offers ?? '—', className: 'max-w-xs' },
    { key: 'opportunity', header: 'Oportunidade para o lead', render: ({ competitor }) => competitor.opportunity ?? '—', className: 'max-w-xs' },
  ]

  return (
    <Table
      columns={columns}
      rows={rows ?? []}
      rowKey={(row) => row.competitor.id}
      onRowClick={(row) => row.lead && navigate(`/leads/${row.lead.id}`)}
      emptyState={
        <EmptyState
          title="Nenhum concorrente cadastrado"
          description="Abra um lead e use a aba Abordagem para registrar os concorrentes locais que já têm site."
        />
      }
    />
  )
}

// ---------------------------------------------------------------------------
// Resumo
// ---------------------------------------------------------------------------

function Summary() {
  const summary = useProspectingSummary()
  if (!summary) return null
  if (summary.total === 0) {
    return <EmptyState title="Nenhum lead ainda" description="O resumo aparece assim que você cadastrar ou importar leads." />
  }

  const statuses = SCRIPT_STAGES.filter((s) => summary.byStatus[s])

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Leads ativos" value={summary.total} icon={<Users size={16} />} chip="violet" />
        <StatCard label={`Prioridade ${LEAD_PRIORITY_LABELS.high.toLowerCase()}`} value={summary.byPriority.high} tone="danger" />
        <StatCard label={`Prioridade ${LEAD_PRIORITY_LABELS.medium.toLowerCase()}`} value={summary.byPriority.medium} tone="warning" />
        <StatCard label={`Prioridade ${LEAD_PRIORITY_LABELS.low.toLowerCase()}`} value={summary.byPriority.low} />
        <StatCard label="Cidades" value={summary.cities} icon={<MapPin size={16} />} chip="teal" />
        <StatCard label="Estados" value={summary.states} icon={<MapPin size={16} />} chip="blue" />
        <StatCard label="Média de avaliações" value={summary.avgReviews ?? '—'} icon={<Star size={16} />} chip="amber" />
        <StatCard label="Maior nº de avaliações" value={summary.maxReviews ?? '—'} icon={<Star size={16} />} chip="amber" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Por cidade</h2>
          <Table
            columns={[
              { key: 'city', header: 'Cidade', render: (r) => (r.state ? `${r.city} · ${r.state}` : r.city) },
              { key: 'count', header: 'Leads', render: (r) => r.count },
              { key: 'high', header: 'Prioridade alta', render: (r) => r.highPriority || '—' },
            ]}
            rows={summary.byCity}
            rowKey={(r) => `${r.city}|${r.state ?? ''}`}
          />
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Por etapa</h2>
          <Card className="flex flex-col gap-2">
            {statuses.map((status) => (
              <div key={status} className="flex items-center justify-between text-sm">
                <span className="text-[var(--color-text-secondary)]">{LEAD_STATUS_LABELS[status]}</span>
                <Badge>{summary.byStatus[status]}</Badge>
              </div>
            ))}
          </Card>
        </section>
      </div>
    </div>
  )
}
