import { useState } from 'react'

import { X } from 'lucide-react'

import { cn } from '@/lib/cn'

interface TagInputProps {
  id?: string
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  invalid?: boolean
}

function normalizeTag(raw: string): string {
  return raw.trim().toLowerCase()
}

export function TagInput({ id, value, onChange, placeholder = 'Adicionar tag…', invalid }: TagInputProps) {
  const [draft, setDraft] = useState('')

  function commitDraft() {
    const tag = normalizeTag(draft)
    if (tag && !value.includes(tag)) {
      onChange([...value, tag])
    }
    setDraft('')
  }

  return (
    <div
      className={cn(
        'flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border bg-[var(--color-surface)] px-2 py-1.5',
        'focus-within:border-[var(--color-accent)] focus-within:ring-2 focus-within:ring-[var(--color-accent)]/20',
        invalid ? 'border-[var(--color-danger)]' : 'border-[var(--color-border)]',
      )}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded bg-[var(--color-surface-hover)] px-2 py-0.5 text-xs font-medium text-[var(--color-text-secondary)]"
        >
          {tag}
          <button
            type="button"
            aria-label={`Remover tag ${tag}`}
            onClick={() => onChange(value.filter((t) => t !== tag))}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        id={id}
        className="min-w-24 flex-1 bg-transparent text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
        placeholder={value.length === 0 ? placeholder : ''}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            commitDraft()
          } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
            onChange(value.slice(0, -1))
          }
        }}
        onBlur={commitDraft}
      />
    </div>
  )
}
