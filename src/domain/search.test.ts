import { describe, expect, it } from 'vitest'

import { matchesAny, matchesSearch, normalizeSearchText } from './search'

describe('normalizeSearchText', () => {
  it('removes accents and lowercases', () => {
    expect(normalizeSearchText('João da Conceição')).toBe('joao da conceicao')
  })
})

describe('matchesSearch', () => {
  it('matches regardless of accents and case', () => {
    expect(matchesSearch('João da Conceição', 'conceicao')).toBe(true)
    expect(matchesSearch('João da Conceição', 'JOAO')).toBe(true)
  })

  it('returns false for non-matching text', () => {
    expect(matchesSearch('João', 'maria')).toBe(false)
  })

  it('returns false for undefined/null haystack', () => {
    expect(matchesSearch(undefined, 'x')).toBe(false)
    expect(matchesSearch(null, 'x')).toBe(false)
  })

  it('matches everything for an empty query', () => {
    expect(matchesSearch('anything', '')).toBe(true)
  })
})

describe('matchesAny', () => {
  it('matches if any field matches', () => {
    expect(matchesAny([undefined, 'Café Central', 'Rio'], 'central')).toBe(true)
  })

  it('returns false if no field matches', () => {
    expect(matchesAny(['Café Central', 'Rio'], 'brasilia')).toBe(false)
  })
})
