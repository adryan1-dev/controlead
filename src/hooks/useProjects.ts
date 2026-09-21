import { useLiveQuery } from 'dexie-react-hooks'

import { db } from '@/db/db'
import type { ProjectStatus } from '@/domain/constants'
import type { Project } from '@/domain/types'

export interface ProjectListFilters {
  status?: ProjectStatus
}

export function useProjects(filters: ProjectListFilters = {}): Project[] | undefined {
  const { status } = filters
  return useLiveQuery(async () => {
    let projects = await db.projects.toArray()
    if (status) projects = projects.filter((p) => p.status === status)
    return projects.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  }, [status])
}

export function useProject(id: string | undefined): Project | undefined {
  return useLiveQuery(() => (id ? db.projects.get(id) : undefined), [id])
}
