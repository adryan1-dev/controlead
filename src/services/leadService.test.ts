import 'fake-indexeddb/auto'

import { beforeEach, describe, expect, it } from 'vitest'

import { createDb, type ControleadDB } from '@/db/db'

import { addNote, archiveLead, changeStatus, createLead, deleteLead, findPotentialDuplicates } from './leadService'

let db: ControleadDB

beforeEach(() => {
  db = createDb(`test-${crypto.randomUUID()}`)
})

describe('createLead', () => {
  it('creates a lead with defaults and a lead_created event', async () => {
    const lead = await createLead({ name: 'Ana Souza' }, db)

    expect(lead.status).toBe('to_contact')
    expect(lead.tags).toEqual([])

    const stored = await db.leads.get(lead.id)
    expect(stored?.name).toBe('Ana Souza')

    const events = await db.events.where('leadId').equals(lead.id).toArray()
    expect(events).toHaveLength(1)
    expect(events[0].type).toBe('lead_created')
  })
})

describe('changeStatus', () => {
  it('updates status, lastInteractionAt, and logs a status_changed event', async () => {
    const lead = await createLead({ name: 'Bruno Lima' }, db)
    await changeStatus(lead.id, 'approached', db)

    const updated = await db.leads.get(lead.id)
    expect(updated?.status).toBe('approached')
    expect(updated?.lastInteractionAt).toBeDefined()

    const events = await db.events.where('leadId').equals(lead.id).toArray()
    const statusEvent = events.find((e) => e.type === 'status_changed')
    expect(statusEvent?.data).toMatchObject({ from: 'to_contact', to: 'approached' })
  })

  it('sets firstClosedAt the first time a lead closes', async () => {
    const lead = await createLead({ name: 'Carla Dias' }, db)
    await changeStatus(lead.id, 'closed', db)

    const updated = await db.leads.get(lead.id)
    expect(updated?.firstClosedAt).toBeDefined()
  })

  it('is a no-op when the status does not change', async () => {
    const lead = await createLead({ name: 'Diego Alves' }, db)
    await changeStatus(lead.id, 'to_contact', db)

    const events = await db.events.where('leadId').equals(lead.id).toArray()
    expect(events).toHaveLength(1) // apenas lead_created
  })
})

describe('addNote', () => {
  it('logs a note event without touching lastInteractionAt', async () => {
    const lead = await createLead({ name: 'Elis Farias' }, db)
    await addNote(lead.id, 'Cliente pediu para ligar semana que vem', db)

    const updated = await db.leads.get(lead.id)
    expect(updated?.lastInteractionAt).toBeUndefined()

    const events = await db.events.where('leadId').equals(lead.id).toArray()
    expect(events.some((e) => e.type === 'note')).toBe(true)
  })
})

describe('archiveLead', () => {
  it('sets archivedAt without deleting the record', async () => {
    const lead = await createLead({ name: 'Fabio Melo' }, db)
    await archiveLead(lead.id, db)

    const updated = await db.leads.get(lead.id)
    expect(updated?.archivedAt).toBeDefined()
  })
})

describe('deleteLead', () => {
  it('deletes a lead with no projects, along with its tasks and events', async () => {
    const lead = await createLead({ name: 'Gustavo Reis' }, db)
    await db.tasks.add({
      id: crypto.randomUUID(),
      leadId: lead.id,
      type: 'follow_up',
      dueDate: '2026-10-01',
      status: 'open',
      createdAt: new Date().toISOString(),
    })

    await deleteLead(lead.id, db)

    expect(await db.leads.get(lead.id)).toBeUndefined()
    expect(await db.tasks.where('leadId').equals(lead.id).count()).toBe(0)
    expect(await db.events.where('leadId').equals(lead.id).count()).toBe(0)
  })

  it('refuses to delete a lead that already has a project', async () => {
    const lead = await createLead({ name: 'Helena Prado' }, db)
    await db.projects.add({
      id: crypto.randomUUID(),
      leadId: lead.id,
      service: 'Site institucional',
      status: 'not_started',
      closedAt: '2026-09-01',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    await expect(deleteLead(lead.id, db)).rejects.toThrow()
    expect(await db.leads.get(lead.id)).toBeDefined()
  })
})

describe('findPotentialDuplicates', () => {
  it('finds another lead with the same whatsapp', async () => {
    const first = await createLead({ name: 'Igor Nunes', whatsapp: '5511987654321' }, db)
    await createLead({ name: 'Igor N. (outro cadastro)', whatsapp: '5511987654321' }, db)

    const duplicates = await findPotentialDuplicates({ whatsapp: '5511987654321' }, undefined, db)
    expect(duplicates.length).toBeGreaterThanOrEqual(1)
    expect(duplicates.some((d) => d.id !== first.id)).toBe(true)
  })

  it('excludes the given id from the results (editing the same lead)', async () => {
    const lead = await createLead({ name: 'Julia Prado', instagram: 'julia.prado' }, db)
    const duplicates = await findPotentialDuplicates({ instagram: 'julia.prado' }, lead.id, db)
    expect(duplicates).toHaveLength(0)
  })
})
