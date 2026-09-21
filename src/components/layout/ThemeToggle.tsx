import { useState } from 'react'

import { Monitor, Moon, Sun } from 'lucide-react'

import { cn } from '@/lib/cn'
import { applyTheme, getStoredTheme, type ThemePreference } from '@/lib/theme'

const OPTIONS: { value: ThemePreference; icon: typeof Monitor; label: string }[] = [
  { value: 'system', icon: Monitor, label: 'Tema do sistema' },
  { value: 'light', icon: Sun, label: 'Tema claro' },
  { value: 'dark', icon: Moon, label: 'Tema escuro' },
]

/** Alterna entre sistema/claro/escuro. Persistido em localStorage (ver lib/theme.ts). */
export function ThemeToggle() {
  const [pref, setPref] = useState<ThemePreference>(getStoredTheme)

  return (
    <div className="flex items-center gap-0.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-0.5">
      {OPTIONS.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          aria-label={label}
          title={label}
          onClick={() => {
            applyTheme(value)
            setPref(value)
          }}
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded transition-colors',
            pref === value
              ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]',
          )}
        >
          <Icon size={13} strokeWidth={2.25} />
        </button>
      ))}
    </div>
  )
}
