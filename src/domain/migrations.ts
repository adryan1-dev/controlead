import { buildDefaultScripts } from './defaultScripts'
import type { BackupData } from './schemas'

/**
 * Migrações puras de dados, uma função por versão (`migrate_v{n-1}_to_v{n}`),
 * aplicadas em sequência tanto no `db.version(n).upgrade(...)` do Dexie
 * quanto na importação de um backup mais antigo (`backupService`).
 */
type Migration = (data: BackupData) => BackupData

/** v2 criou a biblioteca de scripts (semeada com os modelos) e a concorrência por lead. */
function migrate_v1_to_v2(data: BackupData): BackupData {
  return { ...data, scripts: buildDefaultScripts(), competitors: [] }
}

/** Migração de v{N} para v{N+1}, indexada pela versão de origem N. */
const MIGRATIONS: Record<number, Migration> = {
  1: migrate_v1_to_v2,
}

export class UnsupportedMigrationError extends Error {}

/** Aplica em sequência as migrações necessárias para ir de `fromVersion` até `toVersion`. */
export function migrateBackupData(data: BackupData, fromVersion: number, toVersion: number): BackupData {
  let result = data
  for (let version = fromVersion; version < toVersion; version++) {
    const migrate = MIGRATIONS[version]
    if (!migrate) {
      throw new UnsupportedMigrationError(
        `Não há migração de dados da versão ${version} para ${version + 1}. Atualize o Controlead antes de importar este backup.`,
      )
    }
    result = migrate(result)
  }
  return result
}
