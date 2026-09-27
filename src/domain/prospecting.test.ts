import { describe, expect, it } from 'vitest'

import { summarizeProspecting } from './prospecting'
import type { Lead } from './types'

function lead(patch: Partial<Lead>): Lead {
  return {
    id: crypto.randomUUID(),
    name: 'Lead',
    tags: [],
    status: 'to_contact',
    createdAt: '2026-09-24T00:00:00.000Z',
    updatedAt: '2026-09-24T00:00:00.000Z',
    ...patch,
  }
}

describe('summarizeProspecting', () => {
  it('counts priorities, cities, states and reviews', () => {
    const summary = summarizeProspecting([
      lead({ priority: 'high', city: 'Vitória', state: 'ES', googleReviews: 86 }),
      lead({ priority: 'high', city: 'Vitória', state: 'es', googleReviews: 10, status: 'approached' }),
      lead({ priority: 'medium', city: 'Curitiba', state: 'PR' }),
      lead({ city: 'Curitiba/PR' }),
      lead({}),
    ])

    expect(summary.total).toBe(5)
    expect(summary.byPriority).toEqual({ high: 2, medium: 1, low: 0, none: 2 })
    expect(summary.byStatus).toEqual({ to_contact: 4, approached: 1 })
    expect(summary.states).toBe(2)
    expect(summary.avgReviews).toBe(48)
    expect(summary.maxReviews).toBe(86)
    expect(summary.cities).toBe(2)
    expect(summary.byCity.find((c) => c.city === 'Curitiba')).toMatchObject({ state: 'PR', count: 2 })
    expect(summary.byCity.find((c) => c.city === 'Vitória')).toMatchObject({ count: 2, highPriority: 2 })
  })

  it('leaves review stats empty when no lead has reviews', () => {
    const summary = summarizeProspecting([lead({})])
    expect(summary.avgReviews).toBeUndefined()
    expect(summary.maxReviews).toBeUndefined()
  })
})
