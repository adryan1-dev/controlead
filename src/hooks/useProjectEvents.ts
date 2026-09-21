import Dexie from 'dexie'
import { useLiveQuery } from 'dexie-react-hooks'

import { db } from '@/db/db'
import type { Event } from '@/domain/types'

export function useProjectEvents(projectId: string | undefined): Event[] | undefined {
  return useLiveQuery(async () => {
    if (!projectId) return []
    return db.events.where('[projectId+at]').between([projectId, Dexie.minKey], [projectId, Dexie.maxKey]).toArray()
  }, [projectId])
}
