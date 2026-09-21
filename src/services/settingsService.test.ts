import 'fake-indexeddb/auto'

import { beforeEach, describe, expect, it } from 'vitest'

import { createDb, type ControleadDB } from '@/db/db'

import { getSettings, updateSettings } from './settingsService'

let db: ControleadDB

beforeEach(() => {
  db = createDb(`test-${crypto.randomUUID()}`)
})

describe('getSettings', () => {
  it('creates default settings on first access', async () => {
    const settings = await getSettings(db)
    expect(settings.id).toBe('app')
    expect(settings.staleDays).toBeGreaterThan(0)

    const stored = await db.settings.get('app')
    expect(stored).toBeDefined()
  })

  it('returns the same settings on subsequent calls', async () => {
    await getSettings(db)
    const second = await getSettings(db)
    expect(second.id).toBe('app')
  })
})

describe('updateSettings', () => {
  it('merges the patch into the existing settings', async () => {
    await getSettings(db)
    const updated = await updateSettings({ staleDays: 10 }, db)
    expect(updated.staleDays).toBe(10)

    const stored = await db.settings.get('app')
    expect(stored?.staleDays).toBe(10)
  })
})
