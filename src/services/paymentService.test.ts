import 'fake-indexeddb/auto'

import { beforeEach, describe, expect, it } from 'vitest'

import { createDb, type ControleadDB } from '@/db/db'

import { closeDeal } from './dealService'
import { createLead } from './leadService'
import { addPayment, removePayment } from './paymentService'

let db: ControleadDB

beforeEach(() => {
  db = createDb(`test-${crypto.randomUUID()}`)
})

async function setupProject() {
  const lead = await createLead({ name: 'Bruno Lima' }, db)
  return closeDeal(lead.id, { service: 'Site', originalCents: 150000, discountCents: 0, depositCents: 0 }, db)
}

describe('addPayment', () => {
  it('adds a payment and logs payment_added', async () => {
    const project = await setupProject()
    const payment = await addPayment(project.id, { amountCents: 50000, date: '2026-09-21', method: 'pix' }, db)

    const stored = await db.payments.get(payment.id)
    expect(stored?.amountCents).toBe(50000)

    const events = await db.events.where('projectId').equals(project.id).toArray()
    expect(events.some((e) => e.type === 'payment_added')).toBe(true)
  })
})

describe('removePayment', () => {
  it('removes the payment and logs payment_removed', async () => {
    const project = await setupProject()
    const payment = await addPayment(project.id, { amountCents: 50000, date: '2026-09-21', method: 'pix' }, db)

    await removePayment(payment.id, db)

    expect(await db.payments.get(payment.id)).toBeUndefined()
    const events = await db.events.where('projectId').equals(project.id).toArray()
    expect(events.some((e) => e.type === 'payment_removed')).toBe(true)
  })
})
