import { useState } from 'react'

import { AtSign, ChevronDown, ChevronRight, Copy, MessageCircle, Pencil, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { IconButton } from '@/components/ui/IconButton'
import { Select } from '@/components/ui/Select'
import { useToast } from '@/components/ui/Toast'
import { LEAD_STATUS_LABELS, type ContactChannel, type LeadStatus } from '@/domain/constants'
import { normalizeInstagram, whatsappUrl } from '@/domain/links'
import { renderScript, SCRIPT_STAGES } from '@/domain/scripts'
import type { Competitor, Lead, Script } from '@/domain/types'
import { useCompetitors, useScripts } from '@/hooks/useProspecting'
import { removeCompetitor } from '@/services/competitorService'
import { copyText } from '@/lib/clipboard'
import { logContact } from '@/services/leadService'

import { CompetitorForm } from './CompetitorForm'
import { ScriptEditor } from './ScriptEditor'
import { ScriptText } from './ScriptText'

interface LeadApproachProps {
  lead: Lead
}

/** Aba "Abordagem" do lead: scripts da etapa já preenchidos, objeções e concorrência local. */
export function LeadApproach({ lead }: LeadApproachProps) {
  const [stage, setStage] = useState<LeadStatus>(lead.status)
  const [showObjections, setShowObjections] = useState(false)
  const [editing, setEditing] = useState<Script | undefined>(undefined)
  const stageScripts = useScripts('stage', stage)
  const objections = useScripts('objection')
  const competitors = useCompetitors(lead.id) ?? []

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">Mensagens</span>
          <Select className="h-8 w-44" value={stage} onChange={(e) => setStage(e.target.value as LeadStatus)}>
            {SCRIPT_STAGES.map((s) => (
              <option key={s} value={s}>
                {LEAD_STATUS_LABELS[s]}
                {s === lead.status ? ' (atual)' : ''}
              </option>
            ))}
          </Select>
        </div>
        {stageScripts?.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">Nenhum script para esta etapa. Crie um na página Prospecção.</p>
        ) : null}
        {stageScripts?.map((script) => (
          <RenderedScript key={script.id} script={script} lead={lead} competitors={competitors} onEdit={() => setEditing(script)} />
        ))}
      </section>

      <section className="flex flex-col gap-2">
        <button
          type="button"
          className="flex items-center gap-1 self-start text-sm font-medium text-[var(--color-text-primary)]"
          onClick={() => setShowObjections((v) => !v)}
        >
          {showObjections ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          Quebra de objeções
          <span className="text-xs font-normal text-[var(--color-text-muted)]">{objections?.length ?? 0}</span>
        </button>
        {showObjections
          ? objections?.map((script) => (
              <RenderedScript
                key={script.id}
                script={script}
                lead={lead}
                competitors={competitors}
                quoted
                onEdit={() => setEditing(script)}
              />
            ))
          : null}
      </section>

      <CompetitorsSection leadId={lead.id} competitors={competitors} />

      <ScriptEditor
        open={!!editing}
        onClose={() => setEditing(undefined)}
        kind={editing?.kind ?? 'stage'}
        script={editing}
        previewLead={lead}
      />
    </div>
  )
}

function RenderedScript({
  script,
  lead,
  competitors,
  quoted,
  onEdit,
}: {
  script: Script
  lead: Lead
  competitors: Competitor[]
  quoted?: boolean
  onEdit: () => void
}) {
  const { showToast } = useToast()
  const { text, missing } = renderScript(script.body, lead, competitors)
  const wa = lead.whatsapp ? whatsappUrl(lead.whatsapp) : null
  const igHandle = lead.instagram ? normalizeInstagram(lead.instagram) : null

  async function sendVia(channel: ContactChannel, url: string) {
    await copyText(text)
    window.open(url, '_blank', 'noopener,noreferrer')
    await logContact(lead.id, channel)
    showToast(channel === 'instagram' ? 'Mensagem copiada: cole no Direct. Contato registrado.' : 'Contato registrado')
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-[var(--color-border)] p-3">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium text-[var(--color-text-secondary)]">{quoted ? `“${script.title}”` : script.title}</span>
        <IconButton className="-mr-1 -mt-1" icon={<Pencil size={13} />} label="Editar modelo" onClick={onEdit} />
      </div>
      <ScriptText mode="rendered" text={text} className="text-[var(--color-text-primary)]" />
      {missing.length > 0 ? (
        <p className="text-xs text-[var(--color-warning)]">Falta no lead: {missing.join(', ')}. Complete em “Editar dados” ou ajuste antes de enviar.</p>
      ) : null}
      <div className="flex flex-wrap gap-1.5">
        <Button
          size="sm"
          variant="secondary"
          icon={<Copy size={13} />}
          onClick={async () => {
            await copyText(text)
            showToast('Mensagem copiada')
          }}
        >
          Copiar
        </Button>
        {wa ? (
          <Button
            size="sm"
            variant="secondary"
            icon={<MessageCircle size={13} />}
            onClick={() => sendVia('whatsapp', `${wa}?text=${encodeURIComponent(text)}`)}
          >
            WhatsApp
          </Button>
        ) : null}
        {igHandle ? (
          <Button
            size="sm"
            variant="secondary"
            icon={<AtSign size={13} />}
            onClick={() => sendVia('instagram', `https://ig.me/m/${igHandle}`)}
          >
            Direct
          </Button>
        ) : null}
      </div>
    </div>
  )
}

function CompetitorsSection({ leadId, competitors }: { leadId: string; competitors: Competitor[] }) {
  const [form, setForm] = useState<{ competitor?: Competitor } | undefined>(undefined)
  const [removing, setRemoving] = useState<Competitor | undefined>(undefined)

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--color-text-primary)]">Concorrência local</span>
        <Button variant="ghost" size="sm" icon={<Plus size={14} />} onClick={() => setForm({})}>
          Concorrente
        </Button>
      </div>
      {competitors.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">
          Nenhum concorrente registrado. Concorrentes com site viram argumento pela variável {'{concorrente}'}.
        </p>
      ) : (
        competitors.map((c) => (
          <div key={c.id} className="flex items-start justify-between gap-2 rounded-md border border-[var(--color-border)] p-3 text-sm">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="font-medium text-[var(--color-text-primary)]">{c.name}</span>
              {c.website ? <span className="text-xs text-[var(--color-text-muted)]">{c.website}</span> : null}
              {c.offers ? <span className="text-[var(--color-text-secondary)]">{c.offers}</span> : null}
              {c.opportunity ? <span className="text-[var(--color-text-secondary)]">→ {c.opportunity}</span> : null}
            </div>
            <div className="-mr-1 -mt-1 flex shrink-0">
              <IconButton icon={<Pencil size={13} />} label="Editar" onClick={() => setForm({ competitor: c })} />
              <IconButton icon={<Trash2 size={13} />} label="Remover" onClick={() => setRemoving(c)} />
            </div>
          </div>
        ))
      )}
      <CompetitorForm open={!!form} onClose={() => setForm(undefined)} leadId={leadId} competitor={form?.competitor} />
      <ConfirmDialog
        open={!!removing}
        onCancel={() => setRemoving(undefined)}
        onConfirm={async () => {
          if (removing) await removeCompetitor(removing.id)
          setRemoving(undefined)
        }}
        title="Remover concorrente?"
        description={`"${removing?.name ?? ''}" sai da lista deste lead.`}
        confirmLabel="Remover"
        danger
      />
    </section>
  )
}
