import 'fake-indexeddb/auto'

import { beforeEach, describe, expect, it } from 'vitest'

import { createDb, type ControleadDB } from '@/db/db'

import { createLead } from './leadService'
import { cancelOpenTasksForLead, cancelTask, completeTask, createTask, postponeTask } from './taskService'

let db: ControleadDB

beforeEach(() => {
  db = createDb(`test-${crypto.randomUUID()}`)
})

describe('createTask', () => {
  it('creates an open task for a lead', async () => {
    const lead = await createLead({ name: 'Ana' }, db)
    const task = await createTask({ leadId: lead.id, type: 'follow_up', dueDate: '2026-10-01' }, db)
    expect(task.status).toBe('open')
    expect(await db.tasks.get(task.id)).toBeDefined()
  })
})

describe('completeTask', () => {
  it('marks the task done, updates lastInteractionAt, and logs an event', async () => {
    const lead = await createLead({ name: 'Bruno' }, db)
    const task = await createTask({ leadId: lead.id, type: 'follow_up', dueDate: '2026-10-01' }, db)

    await completeTask(task.id, undefined, db)

    const updatedTask = await db.tasks.get(task.id)
    expect(updatedTask?.status).toBe('done')
    expect(updatedTask?.completedAt).toBeDefined()

    const updatedLead = await db.leads.get(lead.id)
    expect(updatedLead?.lastInteractionAt).toBeDefined()

    const events = await db.events.where('leadId').equals(lead.id).toArray()
    expect(events.some((e) => e.type === 'task_completed')).toBe(true)
  })

  it('creates the next task when nextTask is provided (concluir e próxima)', async () => {
    const lead = await createLead({ name: 'Carla' }, db)
    const task = await createTask({ leadId: lead.id, type: 'follow_up', dueDate: '2026-10-01' }, db)

    await completeTask(task.id, { type: 'chase_reply', dueDate: '2026-10-05' }, db)

    const openTasks = await db.tasks.where('leadId').equals(lead.id).filter((t) => t.status === 'open').toArray()
    expect(openTasks).toHaveLength(1)
    expect(openTasks[0].type).toBe('chase_reply')
    expect(openTasks[0].dueDate).toBe('2026-10-05')
  })
})

describe('cancelTask', () => {
  it('marks the task as cancelled', async () => {
    const lead = await createLead({ name: 'Diego' }, db)
    const task = await createTask({ leadId: lead.id, type: 'follow_up', dueDate: '2026-10-01' }, db)
    await cancelTask(task.id, db)
    expect((await db.tasks.get(task.id))?.status).toBe('cancelled')
  })
})

describe('postponeTask', () => {
  it('pushes the due date forward by the given number of days', async () => {
    const lead = await createLead({ name: 'Elis' }, db)
    const task = await createTask({ leadId: lead.id, type: 'follow_up', dueDate: '2026-10-01' }, db)
    await postponeTask(task.id, 1, db)
    expect((await db.tasks.get(task.id))?.dueDate).toBe('2026-10-02')
  })
})

describe('cancelOpenTasksForLead', () => {
  it('cancels every open task for the lead, leaving done/cancelled ones untouched', async () => {
    const lead = await createLead({ name: 'Fabio' }, db)
    const open1 = await createTask({ leadId: lead.id, type: 'follow_up', dueDate: '2026-10-01' }, db)
    const open2 = await createTask({ leadId: lead.id, type: 'chase_reply', dueDate: '2026-10-02' }, db)
    const done = await createTask({ leadId: lead.id, type: 'send_preview', dueDate: '2026-09-20' }, db)
    await completeTask(done.id, undefined, db)

    await cancelOpenTasksForLead(lead.id, db)

    expect((await db.tasks.get(open1.id))?.status).toBe('cancelled')
    expect((await db.tasks.get(open2.id))?.status).toBe('cancelled')
    expect((await db.tasks.get(done.id))?.status).toBe('done')
  })
})
