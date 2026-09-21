import { useEffect, useMemo, useRef, useState } from 'react'

import { Search } from 'lucide-react'
import { useNavigate } from 'react-router'

import { matchesAny } from '@/domain/search'
import { useLeads } from '@/hooks/useLeads'
import { useProjects } from '@/hooks/useProjects'
import { cn } from '@/lib/cn'

interface SearchResult {
  kind: 'lead' | 'project'
  id: string
  title: string
  subtitle: string
}

/** Busca global (Ctrl+K / Cmd+K), sem dependência externa: filtro em memória sobre leads e projetos já carregados. */
export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const leads = useLeads({ includeArchived: true }) ?? []
  const projects = useProjects() ?? []
  const leadById = useMemo(() => new Map(leads.map((l) => [l.id, l])), [leads])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      setQuery('')
      setActiveIndex(0)
      // O foco só pode ser aplicado depois que o <dialog> está de fato aberto no DOM.
      requestAnimationFrame(() => inputRef.current?.focus())
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return []

    const leadResults: SearchResult[] = leads
      .filter((l) => matchesAny([l.name, l.company, l.instagram, l.whatsapp, l.city, l.niche, ...l.tags], query))
      .slice(0, 8)
      .map((l) => ({ kind: 'lead', id: l.id, title: l.name, subtitle: l.company || l.niche || l.city || '' }))

    const projectResults: SearchResult[] = projects
      .filter((p) => matchesAny([p.service, leadById.get(p.leadId)?.name], query))
      .slice(0, 8)
      .map((p) => ({ kind: 'project', id: p.id, title: p.service, subtitle: leadById.get(p.leadId)?.name ?? '' }))

    return [...leadResults, ...projectResults]
  }, [query, leads, projects, leadById])

  function go(index: number) {
    const result = results[index]
    if (!result) return
    setOpen(false)
    navigate(result.kind === 'lead' ? `/leads/${result.id}` : `/projects/${result.id}`)
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={() => setOpen(false)}
      onClick={(e) => {
        if (e.target === dialogRef.current) setOpen(false)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault()
          setOpen(false)
        }
      }}
      className="mt-24 w-full max-w-lg rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-0 shadow-xl backdrop:bg-black/40"
    >
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-3.5 py-3">
        <Search size={16} className="shrink-0 text-[var(--color-text-muted)]" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setActiveIndex(0)
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActiveIndex((i) => Math.min(i + 1, results.length - 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActiveIndex((i) => Math.max(i - 1, 0))
            } else if (e.key === 'Enter') {
              e.preventDefault()
              go(activeIndex)
            }
          }}
          placeholder="Buscar leads e projetos…"
          className="flex-1 bg-transparent text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
        />
        <kbd className="shrink-0 rounded border border-[var(--color-border)] px-1.5 py-0.5 text-xs text-[var(--color-text-muted)]">
          Esc
        </kbd>
      </div>

      <div className="max-h-80 overflow-y-auto p-1.5">
        {query.trim() && results.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-[var(--color-text-muted)]">Nada encontrado.</p>
        ) : null}
        {results.map((result, index) => (
          <button
            key={`${result.kind}-${result.id}`}
            onClick={() => go(index)}
            onMouseEnter={() => setActiveIndex(index)}
            className={cn(
              'flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm',
              index === activeIndex
                ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]',
            )}
          >
            <span className="truncate">{result.title}</span>
            <span className="shrink-0 text-xs text-[var(--color-text-muted)]">
              {result.kind === 'lead' ? 'Lead' : 'Projeto'}
              {result.subtitle ? ` · ${result.subtitle}` : ''}
            </span>
          </button>
        ))}
      </div>
    </dialog>
  )
}
