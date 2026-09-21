import { useState } from 'react'

import { Plus, Trash2 } from 'lucide-react'

import { MoneyText } from '@/components/shared/MoneyText'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { DateInput } from '@/components/ui/DateInput'
import { Field } from '@/components/ui/Field'
import { IconButton } from '@/components/ui/IconButton'
import { Modal } from '@/components/ui/Modal'
import { MoneyInput } from '@/components/ui/MoneyInput'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { PAYMENT_METHOD_LABELS, PAYMENT_METHODS, type PaymentMethod } from '@/domain/constants'
import { formatDate, today } from '@/domain/dates'
import { paymentFormSchema } from '@/domain/schemas'
import type { Payment } from '@/domain/types'
import { addPayment, removePayment } from '@/services/paymentService'

interface PaymentsSectionProps {
  projectId: string
  payments: Payment[]
  balanceCents: number
}

export function PaymentsSection({ projectId, payments, balanceCents }: PaymentsSectionProps) {
  const { showToast } = useToast()
  const [formOpen, setFormOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<Payment | undefined>(undefined)

  const [amountCents, setAmountCents] = useState<number | undefined>(undefined)
  const [date, setDate] = useState(today())
  const [method, setMethod] = useState<PaymentMethod>('pix')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | undefined>(undefined)

  function resetForm() {
    setAmountCents(undefined)
    setDate(today())
    setMethod('pix')
    setNote('')
    setError(undefined)
  }

  const exceedsBalance = amountCents !== undefined && amountCents > balanceCents && balanceCents > 0

  async function handleSubmit() {
    const parsed = paymentFormSchema.safeParse({ amountCents: amountCents ?? 0, date, method, note: note || undefined })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message)
      return
    }
    await addPayment(projectId, parsed.data)
    showToast('Pagamento registrado')
    resetForm()
    setFormOpen(false)
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Pagamentos</h2>
        <Button variant="ghost" size="sm" icon={<Plus size={14} />} onClick={() => setFormOpen(true)}>
          Pagamento
        </Button>
      </div>

      {payments.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">Nenhum pagamento registrado ainda.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between gap-2 rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-[var(--color-text-primary)]">{PAYMENT_METHOD_LABELS[payment.method]}</p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {formatDate(payment.date)}
                  {payment.note ? ` · ${payment.note}` : ''}
                </p>
              </div>
              <MoneyText cents={payment.amountCents} tone="success" />
              <IconButton icon={<Trash2 size={14} />} label="Remover pagamento" onClick={() => setRemoveTarget(payment)} />
            </div>
          ))}
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => {
          resetForm()
          setFormOpen(false)
        }}
        title="Novo pagamento"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Registrar
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <Field label="Valor" required error={error}>
            <MoneyInput value={amountCents} onChange={setAmountCents} />
          </Field>
          {exceedsBalance ? (
            <p className="text-xs text-[var(--color-warning)]">
              Esse valor é maior que o saldo restante (<MoneyText cents={balanceCents} />). O projeto ficará com
              excedente de <MoneyText cents={(amountCents ?? 0) - balanceCents} />.
            </p>
          ) : null}
          <Field label="Data">
            <DateInput value={date} onChange={(v) => setDate(v ?? today())} />
          </Field>
          <Field label="Forma de pagamento">
            <Select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {PAYMENT_METHOD_LABELS[m]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Observação">
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!removeTarget}
        onCancel={() => setRemoveTarget(undefined)}
        onConfirm={async () => {
          if (!removeTarget) return
          await removePayment(removeTarget.id)
          showToast('Pagamento removido')
          setRemoveTarget(undefined)
        }}
        title="Remover pagamento?"
        description="Isso reduz o valor recebido do projeto."
        confirmLabel="Remover"
        danger
      />
    </Card>
  )
}
