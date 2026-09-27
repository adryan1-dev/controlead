import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Combobox } from '@/components/ui/Combobox'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { MoneyInput } from '@/components/ui/MoneyInput'
import { TagInput } from '@/components/ui/TagInput'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { LEAD_PRIORITIES, LEAD_PRIORITY_LABELS, type LeadPriority } from '@/domain/constants'
import { normalizeInstagram, normalizeWhatsapp } from '@/domain/links'
import { leadFormSchema } from '@/domain/schemas'
import type { Lead } from '@/domain/types'
import { useLeadFieldSuggestions } from '@/hooks/useLeads'
import { createLead, findPotentialDuplicates, updateLead } from '@/services/leadService'

interface LeadFormProps {
  open: boolean
  onClose: () => void
  lead?: Lead
  onSaved?: (lead: Lead) => void
}

interface FormState {
  name: string
  company: string
  instagram: string
  whatsapp: string
  website: string
  niche: string
  city: string
  source: string
  tags: string[]
  estimatedValueCents: number | undefined
  notes: string
  specialty: string
  state: string
  priority: LeadPriority | ''
  googleRating: string
  googleReviews: string
  followers: string
  hook: string
}

/** Campo numérico livre ("4,9", "1.344") → número; vazio vira undefined, lixo vira NaN (o zod reprova). */
function parseNumber(value: string): number | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const normalized = trimmed.includes(',') ? trimmed.replace(/\./g, '').replace(',', '.') : trimmed.replace(/\.(?=\d{3}(\D|$))/g, '')
  return Number(normalized)
}

function numberToField(value: number | undefined): string {
  return value === undefined ? '' : String(value).replace('.', ',')
}

function toFormState(lead?: Lead): FormState {
  return {
    name: lead?.name ?? '',
    company: lead?.company ?? '',
    instagram: lead?.instagram ?? '',
    whatsapp: lead?.whatsapp ?? '',
    website: lead?.website ?? '',
    niche: lead?.niche ?? '',
    city: lead?.city ?? '',
    source: lead?.source ?? '',
    tags: lead?.tags ?? [],
    estimatedValueCents: lead?.estimatedValueCents,
    notes: lead?.notes ?? '',
    specialty: lead?.specialty ?? '',
    state: lead?.state ?? '',
    priority: lead?.priority ?? '',
    googleRating: numberToField(lead?.googleRating),
    googleReviews: numberToField(lead?.googleReviews),
    followers: numberToField(lead?.followers),
    hook: lead?.hook ?? '',
  }
}

/** Modal de criar/editar lead. Só `nome` é obrigatório (ver crm-design: minimal required fields). */
export function LeadForm({ open, onClose, lead, onSaved }: LeadFormProps) {
  const { niches, sources, cities } = useLeadFieldSuggestions()
  const { showToast } = useToast()

  const [form, setForm] = useState<FormState>(() => toFormState(lead))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [duplicates, setDuplicates] = useState<Lead[]>([])
  const [saving, setSaving] = useState(false)

  function reset() {
    setForm(toFormState(lead))
    setErrors({})
    setDuplicates([])
  }

  function handleClose() {
    reset()
    onClose()
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setDuplicates([])
  }

  async function handleSubmit(e: React.FormEvent, skipDuplicateCheck = false) {
    e.preventDefault()

    const parsed = leadFormSchema.safeParse({
      ...form,
      company: form.company || undefined,
      instagram: form.instagram || undefined,
      whatsapp: form.whatsapp || undefined,
      website: form.website || undefined,
      niche: form.niche || undefined,
      city: form.city || undefined,
      source: form.source || undefined,
      notes: form.notes || undefined,
      specialty: form.specialty || undefined,
      state: form.state || undefined,
      priority: form.priority || undefined,
      googleRating: parseNumber(form.googleRating),
      googleReviews: parseNumber(form.googleReviews),
      followers: parseNumber(form.followers),
      hook: form.hook || undefined,
    })

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        fieldErrors[String(issue.path[0])] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    setErrors({})

    const normalizedInstagram = parsed.data.instagram ? normalizeInstagram(parsed.data.instagram) : undefined
    const normalizedWhatsapp = parsed.data.whatsapp ? normalizeWhatsapp(parsed.data.whatsapp) : undefined

    if (!skipDuplicateCheck) {
      const dups = await findPotentialDuplicates(
        { instagram: normalizedInstagram, whatsapp: normalizedWhatsapp },
        lead?.id,
      )
      if (dups.length > 0) {
        setDuplicates(dups)
        return
      }
    }

    setSaving(true)
    try {
      const payload = { ...parsed.data, instagram: normalizedInstagram, whatsapp: normalizedWhatsapp }
      if (lead) {
        await updateLead(lead.id, payload)
        showToast('Lead atualizado')
        onSaved?.({ ...lead, ...payload })
      } else {
        const created = await createLead(payload)
        showToast('Lead cadastrado')
        onSaved?.(created)
      }
      reset()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={lead ? 'Editar lead' : 'Novo lead'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={(e) => handleSubmit(e as unknown as React.FormEvent)} disabled={saving}>
            {lead ? 'Salvar' : 'Cadastrar'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        {duplicates.length > 0 ? (
          <div className="col-span-2 rounded-md border border-[var(--color-warning)]/30 bg-[var(--color-warning-bg)] px-3 py-2.5 text-sm text-[var(--color-warning)]">
            <p className="mb-1 font-medium">
              Já existe {duplicates.length === 1 ? 'um lead' : 'leads'} com o mesmo contato: {duplicates.map((d) => d.name).join(', ')}.
            </p>
            <button
              type="button"
              className="font-medium underline"
              onClick={(e) => handleSubmit(e as unknown as React.FormEvent, true)}
            >
              Cadastrar mesmo assim
            </button>
          </div>
        ) : null}

        <Field label="Nome" required error={errors.name} className="col-span-2">
          <Input value={form.name} onChange={(e) => update('name', e.target.value)} autoFocus />
        </Field>

        <Field label="Empresa/profissional">
          <Input value={form.company} onChange={(e) => update('company', e.target.value)} />
        </Field>
        <Field label="Valor estimado">
          <MoneyInput value={form.estimatedValueCents} onChange={(v) => update('estimatedValueCents', v)} />
        </Field>

        <Field label="Instagram" helperText="@handle ou link do perfil">
          <Input value={form.instagram} onChange={(e) => update('instagram', e.target.value)} placeholder="@studio.abc" />
        </Field>
        <Field label="WhatsApp">
          <Input value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} placeholder="(11) 98765-4321" />
        </Field>

        <Field label="Site atual" className="col-span-2">
          <Input value={form.website} onChange={(e) => update('website', e.target.value)} placeholder="exemplo.com" />
        </Field>

        <Field label="Nicho">
          <Combobox value={form.niche} onChange={(v) => update('niche', v)} options={niches} />
        </Field>
        <Field label="Cidade">
          <Combobox value={form.city} onChange={(v) => update('city', v)} options={cities} />
        </Field>

        <Field label="Origem do lead" className="col-span-2">
          <Combobox value={form.source} onChange={(v) => update('source', v)} options={sources} />
        </Field>

        <div className="col-span-2 -mb-1 border-t border-[var(--color-border)] pt-4">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">Pesquisa</span>
          <p className="text-xs text-[var(--color-text-muted)]">Preenche as variáveis dos scripts de prospecção ({'{avaliacoes}'}, {'{gancho}'}…).</p>
        </div>

        <Field label="Especialidade">
          <Input value={form.specialty} onChange={(e) => update('specialty', e.target.value)} placeholder="ortodontia" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="UF" error={errors.state}>
            <Input value={form.state} maxLength={2} onChange={(e) => update('state', e.target.value.toUpperCase())} placeholder="MG" />
          </Field>
          <Field label="Prioridade">
            <Select value={form.priority} onChange={(e) => update('priority', e.target.value as LeadPriority | '')}>
              <option value="">—</option>
              {LEAD_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {LEAD_PRIORITY_LABELS[p]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="col-span-2 grid grid-cols-3 gap-4">
          <Field label="Nota no Google" error={errors.googleRating}>
            <Input inputMode="decimal" value={form.googleRating} onChange={(e) => update('googleRating', e.target.value)} placeholder="4,9" />
          </Field>
          <Field label="Avaliações" error={errors.googleReviews}>
            <Input inputMode="numeric" value={form.googleReviews} onChange={(e) => update('googleReviews', e.target.value)} placeholder="54" />
          </Field>
          <Field label="Seguidores" error={errors.followers}>
            <Input inputMode="numeric" value={form.followers} onChange={(e) => update('followers', e.target.value)} placeholder="1.344" />
          </Field>
        </div>

        <Field label="Gancho" helperText="O argumento principal para este lead" className="col-span-2">
          <Input value={form.hook} onChange={(e) => update('hook', e.target.value)} placeholder="54 avaliações 5,0 sem página própria" />
        </Field>

        <Field label="Tags" className="col-span-2">
          <TagInput value={form.tags} onChange={(v) => update('tags', v)} />
        </Field>

        <Field label="Observações" className="col-span-2">
          <Textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} />
        </Field>
      </form>
    </Modal>
  )
}
