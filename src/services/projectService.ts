import type { ControleadDB } from '@/db/db'
import { db as defaultDb } from '@/db/db'
import type { ProjectItemType, ProjectStatus } from '@/domain/constants'
import { today } from '@/domain/dates'
import type { DateString, Project, ProjectItem } from '@/domain/types'

export type UpdateProjectInput = Partial<Omit<Project, 'id' | 'leadId' | 'createdAt' | 'updatedAt'>>

export async function updateProject(id: string, patch: UpdateProjectInput, database: ControleadDB = defaultDb): Promise<void> {
  await database.projects.update(id, { ...patch, updatedAt: new Date().toISOString() })
}

/** Muda o status do projeto e grava `project_status_changed` no histórico do lead. */
export async function changeProjectStatus(
  id: string,
  status: ProjectStatus,
  database: ControleadDB = defaultDb,
): Promise<void> {
  const now = new Date().toISOString()

  await database.transaction('rw', database.projects, database.events, async () => {
    const project = await database.projects.get(id)
    if (!project) throw new Error(`Projeto ${id} não encontrado`)
    if (project.status === status) return

    const patch: Partial<Project> = { status, updatedAt: now }
    if (status === 'delivered' && !project.deliveredAt) patch.deliveredAt = today()
    await database.projects.update(id, patch)

    await database.events.add({
      id: crypto.randomUUID(),
      leadId: project.leadId,
      projectId: id,
      type: 'project_status_changed',
      at: now,
      data: { from: project.status, to: status },
      createdAt: now,
    })
  })
}

export interface ProjectItemInput {
  description: string
  type: ProjectItemType
  amountCents: number
  date: DateString
  note?: string
}

export async function addProjectItem(
  projectId: string,
  input: ProjectItemInput,
  database: ControleadDB = defaultDb,
): Promise<ProjectItem> {
  const project = await database.projects.get(projectId)
  if (!project) throw new Error(`Projeto ${projectId} não encontrado`)

  const now = new Date().toISOString()
  const item: ProjectItem = { id: crypto.randomUUID(), projectId, ...input, createdAt: now }

  await database.transaction('rw', database.projectItems, database.events, async () => {
    await database.projectItems.add(item)
    await database.events.add({
      id: crypto.randomUUID(),
      leadId: project.leadId,
      projectId,
      type: 'item_added',
      at: now,
      text: input.description,
      data: { amountCents: input.amountCents },
      createdAt: now,
    })
  })

  return item
}

export async function updateProjectItem(
  id: string,
  patch: Partial<ProjectItemInput>,
  database: ControleadDB = defaultDb,
): Promise<void> {
  await database.projectItems.update(id, patch)
}

export async function removeProjectItem(id: string, database: ControleadDB = defaultDb): Promise<void> {
  await database.projectItems.delete(id)
}

/** Exclui o projeto e tudo que pertence só a ele (itens, pagamentos, tarefas, eventos); registra `project_deleted` no lead. */
export async function deleteProject(id: string, database: ControleadDB = defaultDb): Promise<void> {
  const project = await database.projects.get(id)
  if (!project) return
  const now = new Date().toISOString()

  await database.transaction(
    'rw',
    [database.projects, database.projectItems, database.payments, database.tasks, database.events],
    async () => {
      await database.projectItems.where('projectId').equals(id).delete()
      await database.payments.where('projectId').equals(id).delete()
      await database.tasks.where('projectId').equals(id).delete()
      await database.events.where('projectId').equals(id).delete()
      await database.projects.delete(id)

      await database.events.add({
        id: crypto.randomUUID(),
        leadId: project.leadId,
        type: 'project_deleted',
        at: now,
        text: project.service,
        createdAt: now,
      })
    },
  )
}
