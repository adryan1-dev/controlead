import 'fake-indexeddb/auto'

import { beforeEach, describe, expect, it } from 'vitest'

import { createDb, type ControleadDB } from '@/db/db'

import { closeDeal } from './dealService'
import { createLead } from './leadService'
import { addProjectItem, changeProjectStatus, deleteProject, removeProjectItem, updateProject } from './projectService'
import { createTask } from './taskService'

let db: ControleadDB

async function setupProject(db: ControleadDB) {
  const lead = await createLead({ name: 'Ana Souza' }, db)
  const project = await closeDeal(lead.id, { service: 'Site', originalCents: 100000, discountCents: 0, depositCents: 0 }, db)
  return { lead, project }
}

beforeEach(() => {
  db = createDb(`test-${crypto.randomUUID()}`)
})

describe('updateProject', () => {
  it('updates fields and bumps updatedAt', async () => {
    const { project } = await setupProject(db)
    await updateProject(project.id, { previewUrl: 'https://preview.example.com' }, db)
    const updated = await db.projects.get(project.id)
    expect(updated?.previewUrl).toBe('https://preview.example.com')
  })
})

describe('changeProjectStatus', () => {
  it('updates status and logs project_status_changed', async () => {
    const { project } = await setupProject(db)
    await changeProjectStatus(project.id, 'in_progress', db)
    const updated = await db.projects.get(project.id)
    expect(updated?.status).toBe('in_progress')

    const events = await db.events.where('projectId').equals(project.id).toArray()
    expect(events.some((e) => e.type === 'project_status_changed')).toBe(true)
  })

  it('sets deliveredAt the first time a project is marked delivered', async () => {
    const { project } = await setupProject(db)
    await changeProjectStatus(project.id, 'delivered', db)
    const updated = await db.projects.get(project.id)
    expect(updated?.deliveredAt).toBeDefined()
  })
})

describe('addProjectItem / removeProjectItem', () => {
  it('adds an item and logs item_added', async () => {
    const { project } = await setupProject(db)
    const item = await addProjectItem(
      project.id,
      { description: 'Página extra', type: 'additional', amountCents: 15000, date: '2026-09-21' },
      db,
    )
    const items = await db.projectItems.where('projectId').equals(project.id).toArray()
    expect(items).toHaveLength(2) // contratado (do fechamento) + este

    const events = await db.events.where('projectId').equals(project.id).toArray()
    expect(events.some((e) => e.type === 'item_added' && e.text === 'Página extra')).toBe(true)

    await removeProjectItem(item.id, db)
    expect(await db.projectItems.get(item.id)).toBeUndefined()
  })
})

describe('deleteProject', () => {
  it('cascades to items, payments, tasks, and events, and logs project_deleted on the lead', async () => {
    const { lead, project } = await setupProject(db)
    await addProjectItem(project.id, { description: 'Extra', type: 'additional', amountCents: 5000, date: '2026-09-21' }, db)
    await createTask({ leadId: lead.id, projectId: project.id, type: 'deliver', dueDate: '2026-10-01' }, db)

    await deleteProject(project.id, db)

    expect(await db.projects.get(project.id)).toBeUndefined()
    expect(await db.projectItems.where('projectId').equals(project.id).count()).toBe(0)
    expect(await db.payments.where('projectId').equals(project.id).count()).toBe(0)
    expect(await db.tasks.where('projectId').equals(project.id).count()).toBe(0)
    expect(await db.events.where('projectId').equals(project.id).count()).toBe(0)

    const leadEvents = await db.events.where('leadId').equals(lead.id).toArray()
    expect(leadEvents.some((e) => e.type === 'project_deleted')).toBe(true)
  })
})
