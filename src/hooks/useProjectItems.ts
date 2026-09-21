import { useLiveQuery } from 'dexie-react-hooks'

import { db } from '@/db/db'
import type { ProjectItem } from '@/domain/types'

export function useProjectItems(projectId: string | undefined): ProjectItem[] | undefined {
  return useLiveQuery(async () => {
    if (!projectId) return []
    return db.projectItems.where('projectId').equals(projectId).toArray()
  }, [projectId])
}

/** Todos os itens de todos os projetos, agrupados por projectId — evita N+1 em listas (Financeiro, ProjectsPage). */
export function useAllProjectItems(): Map<string, ProjectItem[]> {
  const items = useLiveQuery(() => db.projectItems.toArray(), []) ?? []
  const map = new Map<string, ProjectItem[]>()
  for (const item of items) {
    const arr = map.get(item.projectId)
    if (arr) arr.push(item)
    else map.set(item.projectId, [item])
  }
  return map
}
