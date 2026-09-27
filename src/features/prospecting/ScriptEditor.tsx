import { useRef, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { LEAD_STATUS_LABELS, type LeadStatus, type ScriptKind } from '@/domain/constants'
import { renderScript, SCRIPT_STAGES, SCRIPT_VARIABLES } from '@/domain/scripts'
import type { Lead, Script } from '@/domain/types'
import { createScript, updateScript } from '@/services/scriptService'

import { ScriptText } from './ScriptText'

/** Lead fictício para a prévia quando ainda não há nenhum lead com dados de pesquisa. */
const SAMPLE_LEAD: Lead = {
  id: 'sample',
  name: 'Dra. Mariana Costa',
  company: 'Costa Odontologia',
  instagram: 'dra.marianacosta',
  city: 'Uberlândia',
  state: 'MG',
  specialty: 'ortodontia',
  googleRating: 4.9,
  googleReviews: 87,
  followers: 2400,
  hook: '87 avaliações 5 estrelas que só aparecem no Maps',
  tags: [],
  status: 'to_contact',
  createdAt: '',
  updatedAt: '',
}

interface ScriptEditorProps {
  open: boolean
  onClose: () => void
  kind: ScriptKind
  /** Script sendo editado; sem ele, cria um novo. */
  script?: Script
  /** Etapa inicial ao criar um script de etapa. */
  defaultStage?: LeadStatus
  previewLead?: Lead
}

export function ScriptEditor(props: ScriptEditorProps) {
  // Remonta o formulário a cada abertura para começar com os dados certos.
  return props.open ? <ScriptEditorForm {...props} /> : null
}

function ScriptEditorForm({ onClose, kind, script, defaultStage, previewLead }: ScriptEditorProps) {
  const { showToast } = useToast()
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const [title, setTitle] = useState(script?.title ?? '')
  const [stage, setStage] = useState<LeadStatus>(script?.stage ?? defaultStage ?? 'to_contact')
  const [body, setBody] = useState(script?.body ?? '')
  const [error, setError] = useState<string | undefined>(undefined)
  const [saving, setSaving] = useState(false)

  const isObjection = kind === 'objection'
  const lead = previewLead ?? SAMPLE_LEAD

  function insertVariable(key: string) {
    const el = bodyRef.current
    const token = `{${key}}`
    const start = el?.selectionStart ?? body.length
    const end = el?.selectionEnd ?? body.length
    setBody(body.slice(0, start) + token + body.slice(end))
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(start + token.length, start + token.length)
    })
  }

  async function handleSave() {
    if (!title.trim() || !body.trim()) {
      setError(isObjection ? 'Preencha a objeção e a resposta.' : 'Preencha o nome e a mensagem.')
      return
    }
    setSaving(true)
    try {
      if (script) {
        await updateScript(script.id, { title: title.trim(), body: body.trim(), stage: isObjection ? undefined : stage })
        showToast('Script atualizado')
      } else {
        await createScript({ kind, stage, title: title.trim(), body: body.trim() })
        showToast('Script criado')
      }
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={script ? 'Editar script' : isObjection ? 'Nova objeção' : 'Novo script'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            Salvar
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {error ? <p className="text-sm text-[var(--color-danger)]">{error}</p> : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label={isObjection ? 'Objeção' : 'Nome da mensagem'} className={isObjection ? 'sm:col-span-3' : 'sm:col-span-2'}>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isObjection ? 'Ex.: Tá caro' : 'Ex.: Follow-up 1'}
              autoFocus
            />
          </Field>
          {!isObjection ? (
            <Field label="Etapa">
              <Select value={stage} onChange={(e) => setStage(e.target.value as LeadStatus)}>
                {SCRIPT_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {LEAD_STATUS_LABELS[s]}
                  </option>
                ))}
              </Select>
            </Field>
          ) : null}
        </div>

        <Field label={isObjection ? 'Resposta' : 'Mensagem'}>
          <Textarea ref={bodyRef} rows={7} value={body} onChange={(e) => setBody(e.target.value)} />
        </Field>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--color-text-secondary)]">Inserir variável</span>
          <div className="flex flex-wrap gap-1">
            {SCRIPT_VARIABLES.map((v) => (
              <button
                key={v.key}
                type="button"
                title={v.label}
                onClick={() => insertVariable(v.key)}
                className="rounded-md border border-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              >
                {`{${v.key}}`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-hover)] p-3">
          <span className="text-xs font-medium text-[var(--color-text-secondary)]">
            Prévia com {previewLead ? previewLead.name : 'um lead de exemplo'}
          </span>
          <ScriptText mode="rendered" text={renderScript(body || '…', lead).text} className="text-[var(--color-text-primary)]" />
        </div>
      </div>
    </Modal>
  )
}
