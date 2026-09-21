import { useLiveQuery } from 'dexie-react-hooks'

import { db } from '@/db/db'
import { DEFAULT_SETTINGS } from '@/domain/types'
import type { Settings } from '@/domain/types'

/** Lê as configurações reativamente. Retorna os padrões até a linha existir no banco. */
export function useSettings(): Settings {
  const settings = useLiveQuery(() => db.settings.get('app'), [])
  return settings ?? DEFAULT_SETTINGS
}
