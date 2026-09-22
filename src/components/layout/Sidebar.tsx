import {
  LayoutDashboard,
  Users,
  Briefcase,
  FolderKanban,
  Wallet,
  Settings,
} from 'lucide-react'
import { NavLink } from 'react-router'

import logoUrl from '@/assets/logo.svg'
import { cn } from '@/lib/cn'

import { ThemeToggle } from './ThemeToggle'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true, chip: 'blue' },
  { to: '/leads', label: 'Leads', icon: Users, end: false, chip: 'violet' },
  { to: '/clients', label: 'Clientes', icon: Briefcase, end: false, chip: 'teal' },
  { to: '/projects', label: 'Projetos', icon: FolderKanban, end: false, chip: 'amber' },
  { to: '/finance', label: 'Financeiro', icon: Wallet, end: false, chip: 'rose' },
  { to: '/settings', label: 'Configurações', icon: Settings, end: false, chip: 'violet' },
] as const

const CHIP_CLASSES = {
  blue: 'bg-[var(--color-chip-blue-bg)] text-[var(--color-chip-blue)]',
  violet: 'bg-[var(--color-chip-violet-bg)] text-[var(--color-chip-violet)]',
  teal: 'bg-[var(--color-chip-teal-bg)] text-[var(--color-chip-teal)]',
  amber: 'bg-[var(--color-chip-amber-bg)] text-[var(--color-chip-amber)]',
  rose: 'bg-[var(--color-chip-rose-bg)] text-[var(--color-chip-rose)]',
} as const

interface SidebarProps {
  className?: string
  /** Chamado ao navegar (usado para fechar o menu no layout mobile). */
  onNavigate?: () => void
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  return (
    <aside className={cn('flex w-60 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]', className)}>
      <div className="flex h-16 items-center gap-2 px-5">
        <img src={logoUrl} alt="" className="h-7 w-7 rounded-lg" />
        <span className="text-base font-semibold text-[var(--color-text-primary)]">
          Controlead
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end, chip }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]',
              )
            }
          >
            <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-md', CHIP_CLASSES[chip])}>
              <Icon size={14} strokeWidth={2.25} />
            </span>
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="flex items-center justify-between border-t border-[var(--color-border)] px-3 py-3">
        <span className="text-xs text-[var(--color-text-muted)]">Tema</span>
        <ThemeToggle />
      </div>
    </aside>
  )
}
