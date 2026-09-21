import { describe, expect, it } from 'vitest'

import { closeDealFormSchema } from './schemas'

describe('closeDealFormSchema', () => {
  it('accepts a discount smaller than the original value', () => {
    const result = closeDealFormSchema.safeParse({
      service: 'Site institucional',
      originalCents: 150000,
      discountCents: 10000,
      depositCents: 0,
    })
    expect(result.success).toBe(true)
  })

  it('rejects a discount greater than the original value', () => {
    const result = closeDealFormSchema.safeParse({
      service: 'Site institucional',
      originalCents: 100000,
      discountCents: 150000,
      depositCents: 0,
    })
    expect(result.success).toBe(false)
  })

  it('requires a deposit method when there is a deposit', () => {
    const result = closeDealFormSchema.safeParse({
      service: 'Site institucional',
      originalCents: 150000,
      discountCents: 0,
      depositCents: 50000,
    })
    expect(result.success).toBe(false)
  })

  it('accepts a deposit with its method', () => {
    const result = closeDealFormSchema.safeParse({
      service: 'Site institucional',
      originalCents: 150000,
      discountCents: 0,
      depositCents: 50000,
      depositMethod: 'pix',
    })
    expect(result.success).toBe(true)
  })
})
