import { useLiveQuery } from 'dexie-react-hooks'

import { db } from '@/db/db'
import type { Payment } from '@/domain/types'

export function useProjectPayments(projectId: string | undefined): Payment[] | undefined {
  return useLiveQuery(async () => {
    if (!projectId) return []
    return db.payments.where('projectId').equals(projectId).toArray()
  }, [projectId])
}

/** Todos os pagamentos, agrupados por projectId — evita N+1 em listas (Financeiro, ProjectsPage). */
export function useAllPayments(): Map<string, Payment[]> {
  const payments = useLiveQuery(() => db.payments.toArray(), []) ?? []
  const map = new Map<string, Payment[]>()
  for (const payment of payments) {
    const arr = map.get(payment.projectId)
    if (arr) arr.push(payment)
    else map.set(payment.projectId, [payment])
  }
  return map
}
