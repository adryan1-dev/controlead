import { useLiveQuery } from 'dexie-react-hooks'

import { db } from '@/db/db'
import { nextOpenTask } from '@/domain/rules'
import type { Task } from '@/domain/types'

export function useLeadTasks(leadId: string | undefined): Task[] | undefined {
  return useLiveQuery(async () => {
    if (!leadId) return []
    return db.tasks.where('leadId').equals(leadId).toArray()
  }, [leadId])
}

export function useLeadNextTask(leadId: string | undefined): Task | undefined {
  const tasks = useLeadTasks(leadId)
  return tasks ? nextOpenTask(tasks) : undefined
}
