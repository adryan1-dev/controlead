import { useState } from 'react'

import { Menu as MenuIcon, X } from 'lucide-react'
import { Outlet } from 'react-router'

import { GlobalSearch } from './GlobalSearch'
import { Sidebar } from './Sidebar'

export function AppShell() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--color-bg)] md:flex-row">
      {/* Topo só em telas pequenas: a sidebar fixa (abaixo) cobre desktop. */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 md:hidden">
        <span className="text-base font-semibold text-[var(--color-text-primary)]">Controlead</span>
        <button
          aria-label="Abrir menu"
          onClick={() => setMobileMenuOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
        >
          <MenuIcon size={18} />
        </button>
      </div>

      <Sidebar className="hidden md:flex" />

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            aria-label="Fechar menu"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <Sidebar className="absolute inset-y-0 left-0 z-50" onNavigate={() => setMobileMenuOpen(false)} />
          <button
            aria-label="Fechar menu"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute right-3 top-3 z-50 flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-surface)] text-[var(--color-text-secondary)]"
          >
            <X size={16} />
          </button>
        </div>
      ) : null}

      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-8">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
      <GlobalSearch />
    </div>
  )
}
