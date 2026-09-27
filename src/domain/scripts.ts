/**
 * Variáveis dos scripts de prospecção. Um script é texto livre com
 * marcadores `{variavel}` que são trocados pelos dados do lead na hora de
 * usar. Variável sem dado no lead vira `[variavel]`, bem visível, para
 * não sair uma mensagem com buraco sem você perceber.
 */
import { LEAD_FINAL_STATUSES, LEAD_PIPELINE_ORDER, type LeadStatus } from './constants'
import type { Competitor, Lead } from './types'

/** Etapas que têm scripts: o funil inteiro, mais "não interessado" e "perdido". */
export const SCRIPT_STAGES: LeadStatus[] = [...LEAD_PIPELINE_ORDER, ...LEAD_FINAL_STATUSES.filter((s) => s !== 'closed')]

export interface ScriptVariable {
  key: string
  label: string
  resolve: (lead: Lead, competitors: Competitor[]) => string | undefined
}

const TITLE_PATTERN = /^(dra?\.?)\s+/i

/** "Dra. Mariele Borges" → "Mariele"; "João Silva" → "João". */
export function firstName(name: string): string {
  return name.trim().replace(TITLE_PATTERN, '').split(/\s+/)[0] ?? ''
}

/** "Dra. Mariele Borges" → "Dra. Mariele"; "João Silva" → "João". */
export function salutation(name: string): string {
  const title = name.trim().match(TITLE_PATTERN)?.[1]
  const first = firstName(name)
  if (!title) return first
  const normalizedTitle = title.toLowerCase().startsWith('dra') ? 'Dra.' : 'Dr.'
  return `${normalizedTitle} ${first}`
}

function formatInteger(value: number | undefined): string | undefined {
  return value === undefined ? undefined : value.toLocaleString('pt-BR')
}

function formatRating(value: number | undefined): string | undefined {
  return value === undefined ? undefined : value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

/** Cidade sem o "/UF" que às vezes vem junto ("Uberlândia/MG" → "Uberlândia"). */
export function cityName(city: string | undefined): string | undefined {
  return city?.replace(/\s*[/-]\s*[A-Z]{2}$/, '') || undefined
}

export const SCRIPT_VARIABLES: ScriptVariable[] = [
  { key: 'tratamento', label: 'Tratamento (Dra. Mariele)', resolve: (l) => salutation(l.name) || undefined },
  { key: 'primeiro_nome', label: 'Primeiro nome', resolve: (l) => firstName(l.name) || undefined },
  { key: 'nome', label: 'Nome completo', resolve: (l) => l.name || undefined },
  { key: 'clinica', label: 'Clínica', resolve: (l) => l.company },
  { key: 'cidade', label: 'Cidade', resolve: (l) => cityName(l.city) },
  { key: 'especialidade', label: 'Especialidade', resolve: (l) => l.specialty },
  { key: 'avaliacoes', label: 'Nº de avaliações', resolve: (l) => formatInteger(l.googleReviews) },
  { key: 'nota', label: 'Nota no Google', resolve: (l) => formatRating(l.googleRating) },
  { key: 'seguidores', label: 'Seguidores', resolve: (l) => formatInteger(l.followers) },
  { key: 'instagram', label: '@ do Instagram', resolve: (l) => (l.instagram ? `@${l.instagram}` : undefined) },
  { key: 'gancho', label: 'Gancho', resolve: (l) => l.hook },
  { key: 'concorrente', label: 'Concorrente', resolve: (_l, competitors) => competitors[0]?.name },
]

const VARIABLES_BY_KEY = new Map(SCRIPT_VARIABLES.map((v) => [v.key, v]))

export interface RenderedScript {
  text: string
  /** Variáveis usadas no texto que o lead ainda não tem preenchidas. */
  missing: string[]
}

/** Troca `{variavel}` pelos dados do lead. Marcadores desconhecidos ficam como estão. */
export function renderScript(body: string, lead: Lead, competitors: Competitor[] = []): RenderedScript {
  const missing = new Set<string>()
  const text = body.replace(/\{([a-z_]+)\}/g, (match, key: string) => {
    const variable = VARIABLES_BY_KEY.get(key)
    if (!variable) return match
    const value = variable.resolve(lead, competitors)?.trim()
    if (!value) {
      missing.add(key)
      return `[${key}]`
    }
    return value
  })
  return { text, missing: [...missing] }
}
