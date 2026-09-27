import { cn } from '@/lib/cn'

interface ScriptTextProps {
  text: string
  /** `template`: destaca `{variavel}`. `rendered`: destaca `[variavel]` que ficou sem dado. */
  mode: 'template' | 'rendered'
  className?: string
}

const PATTERNS = {
  template: /(\{[a-z_]+\})/g,
  rendered: /(\[[a-z_]+\])/g,
}

/** Texto de script com as variáveis (ou os buracos) destacados. */
export function ScriptText({ text, mode, className }: ScriptTextProps) {
  const parts = text.split(PATTERNS[mode])
  return (
    <p className={cn('whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text-secondary)]', className)}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span
            key={i}
            className={cn(
              'rounded px-0.5 font-medium',
              mode === 'template'
                ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                : 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
            )}
          >
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </p>
  )
}
