import 'fake-indexeddb/auto'

import { beforeEach, describe, expect, it } from 'vitest'

import { createDb, type ControleadDB } from '@/db/db'
import { buildDefaultScripts } from '@/domain/defaultScripts'

import { addCompetitor } from './competitorService'
import { createLead, deleteLead, importLeads } from './leadService'
import { createScript, deleteScript, moveScript, restoreDefaultScripts, updateScript } from './scriptService'

let db: ControleadDB

beforeEach(() => {
  db = createDb(`test-${crypto.randomUUID()}`)
})

async function stageTitles(stage: string) {
  const scripts = await db.scripts.where('kind').equals('stage').toArray()
  return scripts.filter((s) => s.stage === stage).sort((a, b) => a.order - b.order).map((s) => s.title)
}

describe('scripts', () => {
  it('seeds the default scripts on a fresh database', async () => {
    expect(await db.scripts.count()).toBe(buildDefaultScripts().length)
  })

  it('appends new scripts at the end of their stage and reorders them', async () => {
    const before = await stageTitles('replied')
    const created = await createScript({ kind: 'stage', stage: 'replied', title: 'Novo', body: 'Oi {tratamento}' }, db)
    expect(await stageTitles('replied')).toEqual([...before, 'Novo'])

    await moveScript(created.id, -1, db)
    const after = await stageTitles('replied')
    expect(after[after.length - 2]).toBe('Novo')
  })

  it('does nothing when moving the first script up', async () => {
    const before = await stageTitles('replied')
    const scripts = await db.scripts.where('kind').equals('stage').toArray()
    const top = scripts.filter((s) => s.stage === 'replied').sort((a, b) => a.order - b.order)[0]
    await moveScript(top.id, -1, db)
    expect(await stageTitles('replied')).toEqual(before)
  })

  it('restores edited and deleted defaults without touching custom scripts', async () => {
    const [first, second] = buildDefaultScripts()
    await updateScript(first.id, { title: 'Editado' }, db)
    await deleteScript(second.id, db)
    const custom = await createScript({ kind: 'objection', title: 'Minha objeção', body: '...' }, db)

    await restoreDefaultScripts(db)

    expect((await db.scripts.get(first.id))?.title).toBe(first.title)
    expect(await db.scripts.get(second.id)).toBeDefined()
    expect(await db.scripts.get(custom.id)).toBeDefined()
  })
})

describe('importLeads', () => {
  it('creates new leads with their competitors', async () => {
    const result = await importLeads(
      [{ name: 'Dra. Ana', whatsapp: '34999990000', googleReviews: 54, competitors: [{ name: 'Clínica X' }] }],
      db,
    )
    expect(result).toEqual({ created: 1, updated: 0 })
    const [lead] = await db.leads.toArray()
    expect(lead.googleReviews).toBe(54)
    expect(await db.competitors.where('leadId').equals(lead.id).count()).toBe(1)
  })

  it('enriches an existing lead instead of duplicating it', async () => {
    const existing = await createLead({ name: 'Dra. Ana', instagram: 'draana', company: 'Minha clínica' }, db)
    await addCompetitor(existing.id, { name: 'Clínica X' }, db)

    const result = await importLeads(
      [
        {
          name: 'Dra. Ana',
          instagram: 'draana',
          company: 'Outra',
          specialty: 'ortodontia',
          competitors: [{ name: 'clínica x' }, { name: 'Clínica Y' }],
        },
      ],
      db,
    )

    expect(result).toEqual({ created: 0, updated: 1 })
    expect(await db.leads.count()).toBe(1)
    const lead = await db.leads.get(existing.id)
    expect(lead?.company).toBe('Minha clínica')
    expect(lead?.specialty).toBe('ortodontia')
    const names = (await db.competitors.where('leadId').equals(existing.id).toArray()).map((c) => c.name).sort()
    expect(names).toEqual(['Clínica X', 'Clínica Y'])
  })

  it('keeps the file order of competitors (the first one feeds {concorrente})', async () => {
    const names = ['Zeta', 'Alfa', 'Beta', 'Gama']
    await importLeads([{ name: 'Dra. Ana', whatsapp: '1', competitors: names.map((name) => ({ name })) }], db)
    const stored = (await db.competitors.toArray()).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    expect(stored.map((c) => c.name)).toEqual(names)
  })

  it('deleting a lead removes its competitors', async () => {
    const lead = await createLead({ name: 'Dra. Ana' }, db)
    await addCompetitor(lead.id, { name: 'Clínica X' }, db)
    await deleteLead(lead.id, db)
    expect(await db.competitors.count()).toBe(0)
  })
})
