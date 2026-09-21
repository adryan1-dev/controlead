import Dexie from 'dexie'
import { useLiveQuery } from 'dexie-react-hooks'

import { db } from '@/db/db'
import type { Task } from '@/domain/types'

/** Todas as tarefas abertas (de qualquer lead), para agrupar por lead em listas/Kanban sem N+1 queries. */
export function useOpenTasks(): Task[] | undefined {
  return useLiveQuery(
    () => db.tasks.where('[status+dueDate]').between(['open', Dexie.minKey], ['open', Dexie.maxKey]).toArray(),
    [],
  )
}
