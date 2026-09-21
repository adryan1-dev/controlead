import type { ControleadDB } from '@/db/db'
import { db as defaultDb } from '@/db/db'
import { DEFAULT_SETTINGS } from '@/domain/types'
import type { Settings } from '@/domain/types'

/**
 * Lê a linha única de configurações, criando os valores padrão na
 * primeira vez que o app roda (não há "instalação"/seed separado).
 */
export async function getSettings(database: ControleadDB = defaultDb): Promise<Settings> {
  const existing = await database.settings.get('app')
  if (existing) return existing
  await database.settings.put(DEFAULT_SETTINGS)
  return DEFAULT_SETTINGS
}

export async function updateSettings(
  patch: Partial<Omit<Settings, 'id'>>,
  database: ControleadDB = defaultDb,
): Promise<Settings> {
  const current = await getSettings(database)
  const updated: Settings = { ...current, ...patch }
  await database.settings.put(updated)
  return updated
}
