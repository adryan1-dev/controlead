import { describe, expect, it } from 'vitest'

import { migrateBackupData, UnsupportedMigrationError } from './migrations'
import type { BackupData } from './schemas'

const V1_DATA = {
  leads: [],
  tasks: [],
  events: [],
  projects: [],
  projectItems: [],
  payments: [],
  settings: [],
} as unknown as BackupData

describe('migrateBackupData', () => {
  it('returns the data unchanged when already on the target version', () => {
    expect(migrateBackupData(V1_DATA, 2, 2)).toBe(V1_DATA)
  })

  it('v1 → v2 seeds the default scripts and an empty competitors table', () => {
    const migrated = migrateBackupData(V1_DATA, 1, 2)
    expect(migrated.competitors).toEqual([])
    expect(migrated.scripts.some((s) => s.kind === 'stage' && s.stage === 'to_contact')).toBe(true)
    expect(migrated.scripts.some((s) => s.kind === 'objection')).toBe(true)
  })

  it('throws a clear error when no migration path exists', () => {
    expect(() => migrateBackupData(V1_DATA, 2, 3)).toThrow(UnsupportedMigrationError)
  })
})
