import { useLiveQuery } from 'dexie-react-hooks'

import { db } from '@/db/db'
import type { LeadStatus, ScriptKind } from '@/domain/constants'
import { summarizeProspecting, type ProspectingSummary } from '@/domain/prospecting'
import type { Competitor, Lead, Script } from '@/domain/types'

/** Scripts de um tipo, ordenados. Para `stage`, `stage` filtra uma etapa só. */
export function useScripts(kind: ScriptKind, stage?: LeadStatus): Script[] | undefined {
  return useLiveQuery(async () => {
    const scripts = await db.scripts.where('kind').equals(kind).toArray()
    return scripts.filter((s) => !stage || s.stage === stage).sort((a, b) => a.order - b.order)
  }, [kind, stage])
}

export function useCompetitors(leadId: string): Competitor[] | undefined {
  return useLiveQuery(
    async () => (await db.competitors.where('leadId').equals(leadId).toArray()).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [leadId],
  )
}

export interface CompetitorRow {
  competitor: Competitor
  lead?: Lead
}

export function useAllCompetitors(): CompetitorRow[] | undefined {
  return useLiveQuery(async () => {
    const [competitors, leads] = await Promise.all([db.competitors.toArray(), db.leads.toArray()])
    const leadsById = new Map(leads.map((l) => [l.id, l]))
    return competitors
      .map((competitor) => ({ competitor, lead: leadsById.get(competitor.leadId) }))
      .sort((a, b) => (a.lead?.name ?? '').localeCompare(b.lead?.name ?? '') || a.competitor.name.localeCompare(b.competitor.name))
  }, [])
}

/** Resumo sobre os leads não arquivados. */
export function useProspectingSummary(): ProspectingSummary | undefined {
  return useLiveQuery(async () => summarizeProspecting((await db.leads.toArray()).filter((l) => !l.archivedAt)), [])
}
