import { describe, expect, it } from 'vitest'

import { migrateBackupData, UnsupportedMigrationError } from './migrations'
import type { BackupData } from './schemas'

const EMPTY_DATA: BackupData = {
  leads: [],
  tasks: [],
  events: [],
  projects: [],
  projectItems: [],
  payments: [],
  settings: [],
}

describe('migrateBackupData', () => {
  it('returns the data unchanged when already on the target version', () => {
    expect(migrateBackupData(EMPTY_DATA, 1, 1)).toBe(EMPTY_DATA)
  })

  it('throws a clear error when no migration path exists', () => {
    expect(() => migrateBackupData(EMPTY_DATA, 1, 2)).toThrow(UnsupportedMigrationError)
  })
})
