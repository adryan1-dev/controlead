export type ThemePreference = 'system' | 'light' | 'dark'

const STORAGE_KEY = 'controlead-theme'

export function getStoredTheme(): ThemePreference {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (value === 'light' || value === 'dark') return value
  } catch {
    // localStorage indisponível (modo privado etc.) — cai para 'system'.
  }
  return 'system'
}

/** Aplica a preferência de tema no <html> e persiste a escolha. Chamado de forma síncrona no boot (antes do primeiro paint) para evitar flash. */
export function applyTheme(pref: ThemePreference): void {
  const root = document.documentElement
  if (pref === 'system') {
    delete root.dataset.theme
  } else {
    root.dataset.theme = pref
  }
  try {
    if (pref === 'system') localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, pref)
  } catch {
    // Ignora falha de escrita no localStorage; o tema ainda é aplicado nesta sessão.
  }
}
