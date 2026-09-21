import { useEffect, useState } from 'react'

import { useNavigate } from 'react-router'

import { Button } from '@/components/ui/Button'
import { DateInput } from '@/components/ui/DateInput'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { MoneyInput } from '@/components/ui/MoneyInput'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS, type PaymentMethod } from '@/domain/constants'
import { closeDealFormSchema } from '@/domain/schemas'
import type { Lead } from '@/domain/types'
import { useIsClient } from '@/hooks/useClients'
import { closeDeal } from '@/services/dealService'

interface CloseDealModalProps {
  lead: Lead | undefined
  onClose: () => void
}

/** Fechamento de negócio: cria o projeto a partir do lead (ver dealService.closeDeal). */
export function CloseDealModal({ lead, onClose }: CloseDealModalProps) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const isClient = useIsClient(lead?.id)

  const [service, setService] = useState('')
  const [originalCents, setOriginalCents] = useState<number | undefined>(undefined)
  const [discountCents, setDiscountCents] = useState<number | undefined>(0)
  const [depositCents, setDepositCents] = useState<number | undefined>(0)
  const [depositMethod, setDepositMethod] = useState<PaymentMethod | ''>('')
  const [dueDate, setDueDate] = useState<string | undefined>(undefined)
  const [paymentTerms, setPaymentTerms] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (lead) {
      setService('')
      setOriginalCents(lead.estimatedValueCents)
      setDiscountCents(0)
      setDepositCents(0)
      setDepositMethod('')
      setDueDate(undefined)
      setPaymentTerms('')
      setNotes('')
      setErrors({})
    }
  }, [lead])

  if (!lead) return null

  const finalCents = (originalCents ?? 0) - (discountCents ?? 0)

  function handleFinalChange(newFinal: number | undefined) {
    const original = originalCents ?? 0
    const clampedFinal = Math.min(Math.max(newFinal ?? 0, 0), original)
    setDiscountCents(original - clampedFinal)
  }

  async function handleSubmit() {
    if (!lead) return

    const parsed = closeDealFormSchema.safeParse({
      service,
      originalCents: originalCents ?? 0,
      discountCents: discountCents ?? 0,
      depositCents: depositCents ?? 0,
      depositMethod: depositMethod || undefined,
      dueDate,
      paymentTerms: paymentTerms || undefined,
      notes: notes || undefined,
    })

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message
      setErrors(fieldErrors)
      return
    }
    setErrors({})

    setSaving(true)
    try {
      const project = await closeDeal(lead.id, parsed.data)
      showToast(isClient ? `Novo projeto criado para ${lead.name}` : `Negócio fechado com ${lead.name}`)
      onClose()
      navigate(`/projects/${project.id}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={!!lead}
      onClose={onClose}
      title={isClient ? `Novo projeto — ${lead.name}` : `Fechar negócio — ${lead.name}`}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {isClient ? 'Criar projeto' : 'Fechar negócio'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <Field label="Serviço contratado" required error={errors.service} className="col-span-2">
          <Input value={service} onChange={(e) => setService(e.target.value)} placeholder="Ex.: Site institucional" autoFocus />
        </Field>

        <Field label="Valor original" required error={errors.originalCents}>
          <MoneyInput value={originalCents} onChange={setOriginalCents} />
        </Field>
        <Field label="Desconto" error={errors.discountCents}>
          <MoneyInput value={discountCents} onChange={setDiscountCents} />
        </Field>

        <Field label="Valor final" helperText="editar aqui recalcula o desconto">
          <MoneyInput value={finalCents} onChange={handleFinalChange} />
        </Field>
        <Field label="Prazo previsto">
          <DateInput value={dueDate} onChange={setDueDate} />
        </Field>

        <Field label="Entrada recebida" error={errors.depositCents}>
          <MoneyInput value={depositCents} onChange={setDepositCents} />
        </Field>
        <Field label="Forma de pagamento da entrada" error={errors.depositMethod}>
          <Select value={depositMethod} onChange={(e) => setDepositMethod(e.target.value as PaymentMethod | '')}>
            <option value="">—</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {PAYMENT_METHOD_LABELS[m]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Condições de pagamento" className="col-span-2">
          <Input value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} placeholder="Ex.: 50% entrada + 50% na entrega" />
        </Field>

        <Field label="Observações" className="col-span-2">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
      </div>
    </Modal>
  )
}
