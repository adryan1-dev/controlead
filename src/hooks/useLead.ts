import { useLiveQuery } from 'dexie-react-hooks'

import { db } from '@/db/db'
import type { Lead } from '@/domain/types'

export function useLead(id: string | undefined): Lead | undefined {
  return useLiveQuery(async () => (id ? db.leads.get(id) : undefined), [id])
}
