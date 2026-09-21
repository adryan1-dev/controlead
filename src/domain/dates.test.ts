import { describe, expect, it } from 'vitest'

import { addDays, diffDays, formatDate, isAfter, isBefore, isSameMonth, monthKeyOf } from './dates'

describe('addDays', () => {
  it('adds days within the same month', () => {
    expect(addDays('2026-09-10', 3)).toBe('2026-09-13')
  })

  it('rolls over into the next month', () => {
    expect(addDays('2026-09-29', 3)).toBe('2026-10-02')
  })

  it('handles negative days', () => {
    expect(addDays('2026-09-10', -3)).toBe('2026-09-07')
  })

  it('handles leap years correctly', () => {
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29')
  })
})

describe('diffDays', () => {
  it('returns positive difference when b is after a', () => {
    expect(diffDays('2026-09-10', '2026-09-15')).toBe(5)
  })

  it('returns negative difference when b is before a', () => {
    expect(diffDays('2026-09-15', '2026-09-10')).toBe(-5)
  })

  it('returns 0 for the same date', () => {
    expect(diffDays('2026-09-10', '2026-09-10')).toBe(0)
  })
})

describe('isBefore / isAfter', () => {
  it('compares dates lexicographically (safe for YYYY-MM-DD)', () => {
    expect(isBefore('2026-09-10', '2026-09-11')).toBe(true)
    expect(isAfter('2026-09-11', '2026-09-10')).toBe(true)
  })
})

describe('isSameMonth / monthKeyOf', () => {
  it('checks whether a date belongs to a given month key', () => {
    expect(isSameMonth('2026-09-15', '2026-09')).toBe(true)
    expect(isSameMonth('2026-10-01', '2026-09')).toBe(false)
  })

  it('extracts the month key from a date', () => {
    expect(monthKeyOf('2026-09-15')).toBe('2026-09')
  })
})

describe('formatDate', () => {
  it('formats YYYY-MM-DD as dd/mm/yyyy', () => {
    expect(formatDate('2026-09-21')).toBe('21/09/2026')
  })
})
