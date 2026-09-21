import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Combobox } from '@/components/ui/Combobox'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { MoneyInput } from '@/components/ui/MoneyInput'
import { TagInput } from '@/components/ui/TagInput'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
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
