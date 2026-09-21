import type { DateString } from './types'

/**
 * Datas de calendário são sempre strings `YYYY-MM-DD`, nunca `Date` com
 * hora. Isso evita bugs de fuso horário (uma tarefa "para hoje" não pode
 * virar "para amanhã" dependendo da hora/fuso). Toda aritmética aqui é
 * feita em UTC-meio-dia para não sofrer com horário de verão.
 */

function parse(date: DateString): Date {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day, 12))
}

function format(date: Date): DateString {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Data de hoje (calendário local do usuário) no formato `YYYY-MM-DD`. */
export function today(): DateString {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(date: DateString, days: number): DateString {
  const d = parse(date)
  d.setUTCDate(d.getUTCDate() + days)
  return format(d)
}

/** Diferença em dias (`b - a`). Positivo se `b` for depois de `a`. */
export function diffDays(a: DateString, b: DateString): number {
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.round((parse(b).getTime() - parse(a).getTime()) / msPerDay)
}

export function isBefore(a: DateString, b: DateString): boolean {
  return a < b
}

export function isAfter(a: DateString, b: DateString): boolean {
  return a > b
}

export function isSameMonth(date: DateString, monthKey: string): boolean {
  return date.startsWith(monthKey)
}

/** Chave do mês atual no formato `YYYY-MM`, usada em filtros/URLs. */
export function currentMonthKey(): string {
  return today().slice(0, 7)
}

export function monthKeyOf(date: DateString): string {
  return date.slice(0, 7)
}

const DATE_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
})

/** Formata `YYYY-MM-DD` como "dd/mm/aaaa". */
export function formatDate(date: DateString): string {
  return DATE_FORMATTER.format(parse(date))
}
