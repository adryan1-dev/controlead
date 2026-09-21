import { useLiveQuery } from 'dexie-react-hooks'

import { db } from '@/db/db'
import type { LeadStatus } from '@/domain/constants'
import { matchesAny } from '@/domain/search'
import type { Lead } from '@/domain/types'

export interface LeadListFilters {
  status?: LeadStatus
  niche?: string
  source?: string
  tag?: string
  search?: string
  /** Datas `YYYY-MM-DD`, comparadas contra `lead.createdAt`. */
  createdFrom?: string
  createdTo?: string
  includeArchived?: boolean
}

export function useLeads(filters: LeadListFilters = {}): Lead[] | undefined {
  const { status, niche, source, tag, search, createdFrom, createdTo, includeArchived } = filters

  return useLiveQuery(async () => {
    let leads = await db.leads.toArray()
    if (!includeArchived) leads = leads.filter((l) => !l.archivedAt)
    if (status) leads = leads.filter((l) => l.status === status)
    if (niche) leads = leads.filter((l) => l.niche === niche)
    if (source) leads = leads.filter((l) => l.source === source)
    if (tag) leads = leads.filter((l) => l.tags.includes(tag))
    if (createdFrom) leads = leads.filter((l) => l.createdAt.slice(0, 10) >= createdFrom)
    if (createdTo) leads = leads.filter((l) => l.createdAt.slice(0, 10) <= createdTo)
    if (search) {
      leads = leads.filter((l) => matchesAny([l.name, l.company, l.instagram, l.whatsapp, l.city, l.niche], search))
    }
    return leads.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  }, [status, niche, source, tag, search, createdFrom, createdTo, includeArchived])
}

/** Valores de nicho/origem já usados em algum lead, para sugestão nos formulários. */
export function useLeadFieldSuggestions(): { niches: string[]; sources: string[]; cities: string[] } {
  const result = useLiveQuery(async () => {
    const leads = await db.leads.toArray()
    const niches = new Set<string>()
    const sources = new Set<string>()
    const cities = new Set<string>()
    for (const lead of leads) {
      if (lead.niche) niches.add(lead.niche)
      if (lead.source) sources.add(lead.source)
      if (lead.city) cities.add(lead.city)
    }
    return { niches: [...niches].sort(), sources: [...sources].sort(), cities: [...cities].sort() }
  }, [])

  return result ?? { niches: [], sources: [], cities: [] }
}
