/**
 * Pede ao navegador para não descartar o IndexedDB sob pressão de
 * armazenamento. Não garante nada (depende de heurísticas do navegador,
 * como o site estar "instalado"/favoritado), mas reduz o risco de perda
 * silenciosa de dados. Ver README para as outras proteções (porta fixa,
 * lembrete de backup).
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator.storage?.persist) return false
  try {
    return await navigator.storage.persist()
  } catch {
    return false
  }
}

export async function isStoragePersisted(): Promise<boolean> {
  if (!navigator.storage?.persisted) return false
  try {
    return await navigator.storage.persisted()
  } catch {
    return false
  }
}
