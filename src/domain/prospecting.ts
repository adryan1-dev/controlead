import type { LeadPriority, LeadStatus } from './constants'
import { cityName } from './scripts'
import type { Lead } from './types'

export interface CityRow {
  city: string
  state?: string
  count: number
  highPriority: number
}

export interface ProspectingSummary {
  total: number
  byPriority: Record<LeadPriority | 'none', number>
  byStatus: Partial<Record<LeadStatus, number>>
  cities: number
  states: number
  avgReviews?: number
  maxReviews?: number
  byCity: CityRow[]
}

/** Mesmo resumo da aba RESUMO da planilha, calculado sobre os leads ativos. */
export function summarizeProspecting(leads: Lead[]): ProspectingSummary {
  const byPriority: ProspectingSummary['byPriority'] = { high: 0, medium: 0, low: 0, none: 0 }
  const byStatus: ProspectingSummary['byStatus'] = {}
  const cityMap = new Map<string, CityRow>()
  const states = new Set<string>()
  const reviews: number[] = []

  for (const lead of leads) {
    const state = (lead.state ?? lead.city?.match(/[/-]\s*([A-Z]{2})$/)?.[1])?.trim().toUpperCase() || undefined
    const city = cityName(lead.city?.trim())
    byPriority[lead.priority ?? 'none']++
    byStatus[lead.status] = (byStatus[lead.status] ?? 0) + 1
    if (state) states.add(state)
    if (lead.googleReviews !== undefined) reviews.push(lead.googleReviews)

    if (city) {
      const key = `${city.toLowerCase()}|${state ?? ''}`
      const row = cityMap.get(key) ?? { city, state, count: 0, highPriority: 0 }
      row.count++
      if (lead.priority === 'high') row.highPriority++
      cityMap.set(key, row)
    }
  }

  return {
    total: leads.length,
    byPriority,
    byStatus,
    cities: cityMap.size,
    states: states.size,
    avgReviews: reviews.length ? Math.round(reviews.reduce((a, b) => a + b, 0) / reviews.length) : undefined,
    maxReviews: reviews.length ? Math.max(...reviews) : undefined,
    byCity: [...cityMap.values()].sort((a, b) => b.count - a.count || a.city.localeCompare(b.city)),
  }
}
