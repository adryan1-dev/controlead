import 'fake-indexeddb/auto'

import { beforeEach, describe, expect, it } from 'vitest'

import { createDb, type ControleadDB } from '@/db/db'

import { closeDeal } from './dealService'
import { createLead } from './leadService'
import { createTask } from './taskService'

let db: ControleadDB

beforeEach(() => {
  db = createDb(`test-${crypto.randomUUID()}`)
})

describe('closeDeal', () => {
  it('converts a lead into a project with items, deposit payment, and history', async () => {
    const lead = await createLead({ name: 'Ana Souza' }, db)
    const openTask = await createTask({ leadId: lead.id, type: 'send_proposal', dueDate: '2026-10-01' }, db)

    const project = await closeDeal(
      lead.id,
      {
        service: 'Site institucional',
        originalCents: 150000,
        discountCents: 10000,
        depositCents: 50000,
        depositMethod: 'pix',
        dueDate: '2026-11-01',
      },
      db,
    )

    const updatedLead = await db.leads.get(lead.id)
    expect(updatedLead?.status).toBe('closed')
    expect(updatedLead?.firstClosedAt).toBeDefined()

    const storedProject = await db.projects.get(project.id)
    expect(storedProject?.status).toBe('not_started')
    expect(storedProject?.dueDate).toBe('2026-11-01')

    const items = await db.projectItems.where('projectId').equals(project.id).toArray()
    expect(items.find((i) => i.type === 'contracted')?.amountCents).toBe(150000)
    expect(items.find((i) => i.type === 'discount')?.amountCents).toBe(10000)

    const payments = await db.payments.where('projectId').equals(project.id).toArray()
    expect(payments).toHaveLength(1)
    expect(payments[0].amountCents).toBe(50000)
    expect(payments[0].method).toBe('pix')

    const updatedTask = await db.tasks.get(openTask.id)
    expect(updatedTask?.status).toBe('cancelled')

    const events = await db.events.where('leadId').equals(lead.id).toArray()
    expect(events.some((e) => e.type === 'status_changed' && e.data?.to === 'closed')).toBe(true)
    expect(events.some((e) => e.type === 'deal_closed')).toBe(true)
    expect(events.some((e) => e.type === 'payment_added')).toBe(true)
  })

  it('does not create a payment or discount item when there is none', async () => {
    const lead = await createLead({ name: 'Bruno Lima' }, db)
    const project = await closeDeal(lead.id, { service: 'Landing page', originalCents: 80000, discountCents: 0, depositCents: 0 }, db)

    const items = await db.projectItems.where('projectId').equals(project.id).toArray()
    expect(items).toHaveLength(1)
    expect(items[0].type).toBe('contracted')

    const payments = await db.payments.where('projectId').equals(project.id).toArray()
    expect(payments).toHaveLength(0)

    const events = await db.events.where('leadId').equals(lead.id).toArray()
    expect(events.some((e) => e.type === 'payment_added')).toBe(false)
  })

  it('preserves the original firstClosedAt when a lead is closed a second time (new project)', async () => {
    const lead = await createLead({ name: 'Carla Dias' }, db)
    await closeDeal(lead.id, { service: 'Site', originalCents: 100000, discountCents: 0, depositCents: 0 }, db)
    const firstClose = (await db.leads.get(lead.id))?.firstClosedAt

    await closeDeal(lead.id, { service: 'Manutenção', originalCents: 20000, discountCents: 0, depositCents: 0 }, db)
    const secondClose = (await db.leads.get(lead.id))?.firstClosedAt

    expect(secondClose).toBe(firstClose)
  })
})
