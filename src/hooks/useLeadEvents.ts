import Dexie from 'dexie'
import { useLiveQuery } from 'dexie-react-hooks'

import { db } from '@/db/db'
import type { Event } from '@/domain/types'

export function useLeadEvents(leadId: string | undefined): Event[] | undefined {
  return useLiveQuery(async () => {
    if (!leadId) return []
    return db.events.where('[leadId+at]').between([leadId, Dexie.minKey], [leadId, Dexie.maxKey]).toArray()
  }, [leadId])
}
