import 'fake-indexeddb/auto'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createDb, type ControleadDB } from '@/db/db'

import {
  BackupValidationError,
  buildBackup,
  getCurrentCounts,
  importBackup,
  validateBackupFile,
} from './backupService'
import { createLead } from './leadService'
import { getSettings } from './settingsService'

let db: ControleadDB

beforeEach(() => {
  db = createDb(`test-${crypto.randomUUID()}`)
  // downloadJson usa APIs de DOM (Blob/URL/<a>) que não existem no ambiente
  // jsdom de teste por padrão o suficiente; garantimos que buildBackup/
  // importBackup funcionem sem depender delas indo direto às funções que
  // não disparam download quando possível, e stubamos o resto.
  if (!('createObjectURL' in URL)) {
    // @ts-expect-error jsdom não implementa isso
    URL.createObjectURL = vi.fn(() => 'blob:mock')
  }
  if (!('revokeObjectURL' in URL)) {
    // @ts-expect-error jsdom não implementa isso
    URL.revokeObjectURL = vi.fn()
  }
})

describe('buildBackup / validateBackupFile round-trip', () => {
  it('exports and re-imports identical data', async () => {
    await createLead({ name: 'Ana Souza', niche: 'Odontologia' }, db)
    await createLead({ name: 'Bruno Lima' }, db)

    const backup = await buildBackup(db)
    expect(backup.data.leads).toHaveLength(2)

    const db2 = createDb(`test-${crypto.randomUUID()}`)
    const validated = validateBackupFile(JSON.parse(JSON.stringify(backup)))
    await importBackup(validated, db2)

    const leadsAfter = await db2.leads.toArray()
    expect(leadsAfter.map((l) => l.name).sort()).toEqual(['Ana Souza', 'Bruno Lima'])
    expect(await db2.events.count()).toBe(await db.events.count())
  })

  it('restores default settings when the target db is empty and backup has settings', async () => {
    await getSettings(db)
    const backup = await buildBackup(db)
    const db2 = createDb(`test-${crypto.randomUUID()}`)
    await importBackup(validateBackupFile(JSON.parse(JSON.stringify(backup))), db2)
    const settings = await db2.settings.get('app')
    expect(settings).toBeDefined()
  })
})

describe('validateBackupFile rejections', () => {
  it('rejects non-object input as corrupted', () => {
    expect(() => validateBackupFile('not json')).toThrow(BackupValidationError)
    expect(() => validateBackupFile(null)).toThrow(BackupValidationError)
  })

  it('rejects a file from a different app', () => {
    expect(() => validateBackupFile({ app: 'other-app', format: 1, schemaVersion: 1, data: {} })).toThrow(
      BackupValidationError,
    )
  })

  it('rejects a schemaVersion newer than the current app', () => {
    expect(() =>
      validateBackupFile({
        app: 'controlead',
        format: 1,
        schemaVersion: 999,
        exportedAt: new Date().toISOString(),
        data: { leads: [], tasks: [], events: [], projects: [], projectItems: [], payments: [], settings: [] },
      }),
    ).toThrow(BackupValidationError)
  })

  it('rejects a project referencing a nonexistent lead', () => {
    const backup = {
      app: 'controlead',
      format: 1,
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      data: {
        leads: [],
        tasks: [],
        events: [],
        projects: [
          {
            id: 'p1',
            leadId: 'missing-lead',
            service: 'Site',
            status: 'not_started',
            closedAt: '2026-09-01',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        projectItems: [],
        payments: [],
        settings: [],
      },
    }
    expect(() => validateBackupFile(backup)).toThrow(BackupValidationError)
  })

  it('rejects duplicate ids within a table', () => {
    const now = new Date().toISOString()
    const lead = {
      id: 'dup',
      name: 'Lead',
      tags: [],
      status: 'to_contact',
      createdAt: now,
      updatedAt: now,
    }
    const backup = {
      app: 'controlead',
      format: 1,
      schemaVersion: 1,
      exportedAt: now,
      data: {
        leads: [lead, lead],
        tasks: [],
        events: [],
        projects: [],
        projectItems: [],
        payments: [],
        settings: [],
      },
    }
    expect(() => validateBackupFile(backup)).toThrow(BackupValidationError)
  })
})

describe('getCurrentCounts', () => {
  it('reflects the number of records per table', async () => {
    await createLead({ name: 'Carla Dias' }, db)
    const counts = await getCurrentCounts(db)
    expect(counts.leads).toBe(1)
    expect(counts.projects).toBe(0)
  })
})
