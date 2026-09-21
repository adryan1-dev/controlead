import type { ControleadDB } from '@/db/db'
import { db as defaultDb } from '@/db/db'
import { CURRENT_SCHEMA_VERSION } from '@/db/schema'
import { migrateBackupData, UnsupportedMigrationError } from '@/domain/migrations'
import { backupFileSchema, type BackupData, type BackupFile } from '@/domain/schemas'
import { DEFAULT_SETTINGS } from '@/domain/types'

import { updateSettings } from './settingsService'

export const BACKUP_APP_ID = 'controlead'
export const BACKUP_FORMAT = 1

export class BackupValidationError extends Error {}

const TABLE_KEYS = ['leads', 'tasks', 'events', 'projects', 'projectItems', 'payments', 'settings'] as const
type TableKey = (typeof TABLE_KEYS)[number]

/** Lê todas as tabelas em uma única transação de leitura e monta o envelope de backup. */
export async function buildBackup(database: ControleadDB = defaultDb): Promise<BackupFile> {
  const tables = database.tables.filter((t) => (TABLE_KEYS as readonly string[]).includes(t.name))

  return database.transaction('r', tables, async () => {
    const [leads, tasks, events, projects, projectItems, payments, settings] = await Promise.all([
      database.leads.toArray(),
      database.tasks.toArray(),
      database.events.toArray(),
      database.projects.toArray(),
      database.projectItems.toArray(),
      database.payments.toArray(),
      database.settings.toArray(),
    ])

    const data: BackupData = { leads, tasks, events, projects, projectItems, payments, settings }

    return {
      app: BACKUP_APP_ID,
      format: BACKUP_FORMAT,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      counts: Object.fromEntries(TABLE_KEYS.map((key) => [key, data[key].length])),
      data,
    } satisfies BackupFile
  })
}

function backupFileName(date = new Date()): string {
  const stamp = date.toISOString().replace(/[:.]/g, '-').slice(0, 16)
  return `controlead-backup-${stamp}.json`
}

function downloadJson(payload: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

/** Gera o backup, baixa o arquivo e atualiza `settings.lastBackupAt`. */
export async function exportBackup(database: ControleadDB = defaultDb): Promise<BackupFile> {
  const backup = await buildBackup(database)
  downloadJson(backup, backupFileName())
  await updateSettings({ lastBackupAt: new Date().toISOString() }, database)
  return backup
}

/**
 * Valida um arquivo de backup lido do disco: formato, app, versão de
 * schema (migrando se for mais antiga), estrutura dos dados (zod) e
 * integridade referencial. Nunca toca no banco — apenas lê e valida.
 * Lança `BackupValidationError` com uma mensagem legível em qualquer
 * problema; nunca deixa dados parcialmente aplicados.
 */
export function validateBackupFile(raw: unknown): BackupFile {
  if (typeof raw !== 'object' || raw === null) {
    throw new BackupValidationError('Arquivo corrompido: não é um JSON válido de backup.')
  }

  const envelope = raw as Record<string, unknown>

  if (envelope.app !== BACKUP_APP_ID) {
    throw new BackupValidationError('Este arquivo não é um backup do Controlead.')
  }
  if (envelope.format !== BACKUP_FORMAT) {
    throw new BackupValidationError('Formato de backup desconhecido ou incompatível com esta versão do Controlead.')
  }

  const schemaVersion = envelope.schemaVersion
  if (typeof schemaVersion !== 'number' || !Number.isInteger(schemaVersion) || schemaVersion < 1) {
    throw new BackupValidationError('Arquivo corrompido: versão de schema inválida.')
  }
  if (schemaVersion > CURRENT_SCHEMA_VERSION) {
    throw new BackupValidationError(
      `Este backup foi feito em uma versão mais nova do Controlead (schema v${schemaVersion}). Atualize o app antes de importar.`,
    )
  }

  let migratedData = envelope.data
  if (schemaVersion < CURRENT_SCHEMA_VERSION) {
    try {
      migratedData = migrateBackupData(envelope.data as BackupData, schemaVersion, CURRENT_SCHEMA_VERSION)
    } catch (err) {
      if (err instanceof UnsupportedMigrationError) throw new BackupValidationError(err.message)
      throw err
    }
  }

  const parsed = backupFileSchema.safeParse({ ...envelope, schemaVersion: CURRENT_SCHEMA_VERSION, data: migratedData })
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    const path = first.path.join('.')
    throw new BackupValidationError(`Backup inválido${path ? ` em "${path}"` : ''}: ${first.message}.`)
  }

  const backup = parsed.data
  checkReferentialIntegrity(backup.data)

  return backup
}

function checkReferentialIntegrity(data: BackupData): void {
  for (const key of TABLE_KEYS) {
    const ids = data[key].map((row) => row.id)
    const unique = new Set(ids)
    if (unique.size !== ids.length) {
      throw new BackupValidationError(`Backup inválido: IDs duplicados na tabela "${key}".`)
    }
  }

  const leadIds = new Set(data.leads.map((l) => l.id))
  const projectIds = new Set(data.projects.map((p) => p.id))

  for (const project of data.projects) {
    if (!leadIds.has(project.leadId)) {
      throw new BackupValidationError(`Backup inválido: projeto "${project.id}" referencia um lead inexistente.`)
    }
  }
  for (const item of data.projectItems) {
    if (!projectIds.has(item.projectId)) {
      throw new BackupValidationError(`Backup inválido: item "${item.id}" referencia um projeto inexistente.`)
    }
  }
  for (const payment of data.payments) {
    if (!projectIds.has(payment.projectId)) {
      throw new BackupValidationError(`Backup inválido: pagamento "${payment.id}" referencia um projeto inexistente.`)
    }
  }
  for (const task of data.tasks) {
    if (!leadIds.has(task.leadId)) {
      throw new BackupValidationError(`Backup inválido: tarefa "${task.id}" referencia um lead inexistente.`)
    }
    if (task.projectId && !projectIds.has(task.projectId)) {
      throw new BackupValidationError(`Backup inválido: tarefa "${task.id}" referencia um projeto inexistente.`)
    }
  }
  for (const event of data.events) {
    if (!leadIds.has(event.leadId)) {
      throw new BackupValidationError(`Backup inválido: evento "${event.id}" referencia um lead inexistente.`)
    }
    if (event.projectId && !projectIds.has(event.projectId)) {
      throw new BackupValidationError(`Backup inválido: evento "${event.id}" referencia um projeto inexistente.`)
    }
  }
}

/** Contagens atuais do banco, para comparar com as do backup antes de confirmar a importação. */
export async function getCurrentCounts(database: ControleadDB = defaultDb): Promise<Record<TableKey, number>> {
  const [leads, tasks, events, projects, projectItems, payments, settings] = await Promise.all([
    database.leads.count(),
    database.tasks.count(),
    database.events.count(),
    database.projects.count(),
    database.projectItems.count(),
    database.payments.count(),
    database.settings.count(),
  ])
  return { leads, tasks, events, projects, projectItems, payments, settings }
}

/**
 * Substitui TODOS os dados atuais pelos do backup (já validado por
 * `validateBackupFile`). Baixa automaticamente um backup dos dados
 * atuais antes de apagar qualquer coisa. A troca roda em uma única
 * transação: se algo falhar no meio, o Dexie desfaz tudo sozinho.
 */
export async function importBackup(backup: BackupFile, database: ControleadDB = defaultDb): Promise<void> {
  const currentCounts = await getCurrentCounts(database)
  const hasExistingData = Object.values(currentCounts).some((count) => count > 0)
  if (hasExistingData) {
    await exportBackup(database)
  }

  const tables = database.tables.filter((t) => (TABLE_KEYS as readonly string[]).includes(t.name))
  // Se o backup não tiver settings (não deveria acontecer, mas é barato se proteger),
  // recria os padrões em vez de deixar o app sem nenhuma linha de configuração.
  const settingsRows = backup.data.settings.length > 0 ? backup.data.settings : [DEFAULT_SETTINGS]

  await database.transaction('rw', tables, async () => {
    await Promise.all(tables.map((t) => t.clear()))
    await Promise.all([
      database.leads.bulkAdd(backup.data.leads),
      database.tasks.bulkAdd(backup.data.tasks),
      database.events.bulkAdd(backup.data.events),
      database.projects.bulkAdd(backup.data.projects),
      database.projectItems.bulkAdd(backup.data.projectItems),
      database.payments.bulkAdd(backup.data.payments),
      database.settings.bulkAdd(settingsRows),
    ])
  })
}
