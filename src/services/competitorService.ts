import type { ControleadDB } from '@/db/db'
import { db as defaultDb } from '@/db/db'
import type { Competitor, IsoTimestamp } from '@/domain/types'

export type CompetitorInput = Pick<Competitor, 'name' | 'website' | 'offers' | 'opportunity'>

export async function addCompetitor(
  leadId: string,
  input: CompetitorInput,
  database: ControleadDB = defaultDb,
  createdAt: IsoTimestamp = new Date().toISOString(),
): Promise<Competitor> {
  const competitor: Competitor = { ...input, id: crypto.randomUUID(), leadId, createdAt }
  await database.competitors.add(competitor)
  return competitor
}

export async function updateCompetitor(id: string, patch: Partial<CompetitorInput>, database: ControleadDB = defaultDb): Promise<void> {
  await database.competitors.update(id, patch)
}

export async function removeCompetitor(id: string, database: ControleadDB = defaultDb): Promise<void> {
  await database.competitors.delete(id)
}
