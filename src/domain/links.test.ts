import { describe, expect, it } from 'vitest'

import { instagramUrl, normalizeInstagram, websiteUrl, whatsappUrl } from './links'

describe('whatsappUrl', () => {
  it('prefixes 55 for an 11-digit local number', () => {
    expect(whatsappUrl('11987654321')).toBe('https://wa.me/5511987654321')
  })

  it('prefixes 55 for a 10-digit local number', () => {
    expect(whatsappUrl('1133334444')).toBe('https://wa.me/551133334444')
  })

  it('keeps numbers that already include a country code', () => {
    expect(whatsappUrl('5511987654321')).toBe('https://wa.me/5511987654321')
  })

  it('strips formatting characters', () => {
    expect(whatsappUrl('(11) 98765-4321')).toBe('https://wa.me/5511987654321')
  })

  it('returns null for empty input', () => {
    expect(whatsappUrl('')).toBeNull()
  })
})

describe('normalizeInstagram / instagramUrl', () => {
  it('strips a leading @', () => {
    expect(normalizeInstagram('@studio.abc')).toBe('studio.abc')
  })

  it('extracts the handle from a pasted URL', () => {
    expect(normalizeInstagram('https://instagram.com/studio.abc/?hl=en')).toBe('studio.abc')
  })

  it('builds the profile URL', () => {
    expect(instagramUrl('@studio.abc')).toBe('https://instagram.com/studio.abc')
  })
})

describe('websiteUrl', () => {
  it('prefixes https:// when missing', () => {
    expect(websiteUrl('example.com')).toBe('https://example.com')
  })

  it('keeps an existing protocol', () => {
    expect(websiteUrl('http://example.com')).toBe('http://example.com')
  })

  it('returns null for empty input', () => {
    expect(websiteUrl('')).toBeNull()
  })
})
