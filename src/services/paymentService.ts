import type { ControleadDB } from '@/db/db'
import { db as defaultDb } from '@/db/db'
import type { PaymentMethod } from '@/domain/constants'
import type { DateString, Payment } from '@/domain/types'

export interface PaymentInput {
  amountCents: number
  date: DateString
  method: PaymentMethod
  note?: string
}

export async function addPayment(
  projectId: string,
  input: PaymentInput,
  database: ControleadDB = defaultDb,
): Promise<Payment> {
  const project = await database.projects.get(projectId)
  if (!project) throw new Error(`Projeto ${projectId} não encontrado`)

  const now = new Date().toISOString()
  const payment: Payment = { id: crypto.randomUUID(), projectId, ...input, createdAt: now }

  await database.transaction('rw', database.payments, database.events, async () => {
    await database.payments.add(payment)
    await database.events.add({
      id: crypto.randomUUID(),
      leadId: project.leadId,
      projectId,
      type: 'payment_added',
      at: now,
      data: { amountCents: input.amountCents },
      createdAt: now,
    })
  })

  return payment
}

export async function updatePayment(
  id: string,
  patch: Partial<PaymentInput>,
  database: ControleadDB = defaultDb,
): Promise<void> {
  await database.payments.update(id, patch)
}

export async function removePayment(id: string, database: ControleadDB = defaultDb): Promise<void> {
  const payment = await database.payments.get(id)
  if (!payment) return
  const project = await database.projects.get(payment.projectId)
  const now = new Date().toISOString()

  await database.transaction('rw', database.payments, database.events, async () => {
    await database.payments.delete(id)
    if (project) {
      await database.events.add({
        id: crypto.randomUUID(),
        leadId: project.leadId,
        projectId: payment.projectId,
        type: 'payment_removed',
        at: now,
        data: { amountCents: payment.amountCents },
        createdAt: now,
      })
    }
  })
}
