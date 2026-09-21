import { describe, expect, it } from 'vitest'

import { formatCents, parseCents, sumCents } from './money'

describe('parseCents', () => {
  it('parses plain integer strings', () => {
    expect(parseCents('1500')).toBe(150000)
  })

  it('parses thousands-separated values', () => {
    expect(parseCents('1.500')).toBe(150000)
  })

  it('parses comma-decimal values', () => {
    expect(parseCents('1500,50')).toBe(150050)
  })

  it('parses full BRL currency strings', () => {
    expect(parseCents('R$ 1.500,00')).toBe(150000)
  })

  it('parses decimal-dot values without thousands separator', () => {
    expect(parseCents('1500.5')).toBe(150050)
  })

  it('returns null for empty or non-numeric input', () => {
    expect(parseCents('')).toBeNull()
    expect(parseCents('abc')).toBeNull()
  })

  it('handles negative values', () => {
    expect(parseCents('-100')).toBe(-10000)
  })
})

describe('formatCents', () => {
  it('formats cents as BRL', () => {
    expect(formatCents(150000)).toContain('1.500,00')
  })
})

describe('sumCents', () => {
  it('sums a list of cent values', () => {
    expect(sumCents([100, 200, 300])).toBe(600)
  })

  it('returns 0 for an empty list', () => {
    expect(sumCents([])).toBe(0)
  })
})
