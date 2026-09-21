import type { ControleadDB } from '@/db/db'
import { db as defaultDb } from '@/db/db'
import type { TaskType } from '@/domain/constants'
import { addDays } from '@/domain/dates'
import type { DateString, Task } from '@/domain/types'

export interface CreateTaskInput {
  leadId: string
  projectId?: string
  type: TaskType
  dueDate: DateString
  note?: string
}

export async function createTask(input: CreateTaskInput, database: ControleadDB = defaultDb): Promise<Task> {
  const task: Task = {
    id: crypto.randomUUID(),
    leadId: input.leadId,
    projectId: input.projectId,
    type: input.type,
    dueDate: input.dueDate,
    note: input.note,
    status: 'open',
    createdAt: new Date().toISOString(),
  }
  await database.tasks.add(task)
  return task
}

export interface NextTaskInput {
  type: TaskType
  dueDate: DateString
  note?: string
}

/**
 * Conclui a tarefa (evento `task_completed`, atualiza `lastInteractionAt`
 * do lead) e, se `nextTask` for informado, já cria a próxima tarefa na
 * mesma transação — o fluxo "concluir e cadastrar a próxima" do plano.
 */
export async function completeTask(
  taskId: string,
  nextTask?: NextTaskInput,
  database: ControleadDB = defaultDb,
): Promise<void> {
  const now = new Date().toISOString()

  await database.transaction('rw', database.tasks, database.leads, database.events, async () => {
    const task = await database.tasks.get(taskId)
    if (!task) throw new Error(`Tarefa ${taskId} não encontrada`)

    await database.tasks.update(taskId, { status: 'done', completedAt: now })
    await database.leads.update(task.leadId, { lastInteractionAt: now, updatedAt: now })
    await database.events.add({
      id: crypto.randomUUID(),
      leadId: task.leadId,
      projectId: task.projectId,
      type: 'task_completed',
      at: now,
      data: { taskType: task.type },
      createdAt: now,
    })

    if (nextTask) {
      await database.tasks.add({
        id: crypto.randomUUID(),
        leadId: task.leadId,
        projectId: task.projectId,
        type: nextTask.type,
        dueDate: nextTask.dueDate,
        note: nextTask.note,
        status: 'open',
        createdAt: now,
      })
    }
  })
}

export async function cancelTask(taskId: string, database: ControleadDB = defaultDb): Promise<void> {
  await database.tasks.update(taskId, { status: 'cancelled' })
}

export async function postponeTask(taskId: string, days = 1, database: ControleadDB = defaultDb): Promise<void> {
  const task = await database.tasks.get(taskId)
  if (!task) throw new Error(`Tarefa ${taskId} não encontrada`)
  await database.tasks.update(taskId, { dueDate: addDays(task.dueDate, days) })
}

/** Cancela todas as tarefas abertas de um lead (ex.: ao marcar como Perdido/Não interessado ou ao fechar negócio). */
export async function cancelOpenTasksForLead(leadId: string, database: ControleadDB = defaultDb): Promise<void> {
  const openTasks = await database.tasks
    .where('leadId')
    .equals(leadId)
    .filter((t) => t.status === 'open')
    .toArray()
  await database.tasks.bulkPut(openTasks.map((t) => ({ ...t, status: 'cancelled' as const })))
}
