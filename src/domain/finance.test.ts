import { describe, expect, it } from 'vitest'

import { getProjectFinance } from './finance'
import type { Payment, ProjectItem } from './types'

function item(overrides: Partial<ProjectItem>): ProjectItem {
  return {
    id: crypto.randomUUID(),
    projectId: 'p1',
    description: 'Item',
    type: 'contracted',
    amountCents: 0,
    date: '2026-09-01',
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

function payment(overrides: Partial<Payment>): Payment {
  return {
    id: crypto.randomUUID(),
    projectId: 'p1',
    amountCents: 0,
    date: '2026-09-01',
    method: 'pix',
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('getProjectFinance', () => {
  it('marks a project with no payments as unpaid', () => {
    const finance = getProjectFinance([item({ amountCents: 150000 })], [])
    expect(finance.totalCents).toBe(150000)
    expect(finance.receivedCents).toBe(0)
    expect(finance.status).toBe('unpaid')
  })

  it('marks a project with a partial payment as partial', () => {
    const finance = getProjectFinance([item({ amountCents: 150000 })], [payment({ amountCents: 50000 })])
    expect(finance.balanceCents).toBe(100000)
    expect(finance.status).toBe('partial')
  })

  it('marks a project as paid when the balance reaches zero', () => {
    const finance = getProjectFinance([item({ amountCents: 150000 })], [payment({ amountCents: 150000 })])
    expect(finance.balanceCents).toBe(0)
    expect(finance.status).toBe('paid')
  })

  it('marks a project as paid (with surplus) when overpaid', () => {
    const finance = getProjectFinance([item({ amountCents: 150000 })], [payment({ amountCents: 200000 })])
    expect(finance.balanceCents).toBe(-50000)
    expect(finance.status).toBe('paid')
  })

  it('excludes courtesy items from the total', () => {
    const finance = getProjectFinance(
      [item({ amountCents: 150000 }), item({ type: 'courtesy', amountCents: 30000 })],
      [],
    )
    expect(finance.totalCents).toBe(150000)
    expect(finance.courtesyCents).toBe(30000)
  })

  it('subtracts discount items from the total', () => {
    const finance = getProjectFinance(
      [item({ amountCents: 150000 }), item({ type: 'discount', amountCents: 10000 })],
      [],
    )
    expect(finance.totalCents).toBe(140000)
    expect(finance.discountCents).toBe(10000)
  })

  it('adds additional items to the total', () => {
    const finance = getProjectFinance(
      [item({ amountCents: 150000 }), item({ type: 'additional', amountCents: 15000 })],
      [],
    )
    expect(finance.totalCents).toBe(165000)
  })

  it('marks a fully-courtesy project as no_charge', () => {
    const finance = getProjectFinance([item({ type: 'courtesy', amountCents: 30000 })], [])
    expect(finance.totalCents).toBe(0)
    expect(finance.status).toBe('no_charge')
  })
})
