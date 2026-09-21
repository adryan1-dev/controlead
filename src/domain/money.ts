/**
 * Dinheiro é sempre um inteiro em centavos (`amountCents`). Nunca usar
 * `number` em ponto flutuante para valores financeiros — evita erros de
 * arredondamento em somas (ex.: 0.1 + 0.2 !== 0.3).
 */

const BRL_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

/** Formata centavos como "R$ 1.500,00". */
export function formatCents(amountCents: number): string {
  return BRL_FORMATTER.format(amountCents / 100)
}

/**
 * Converte texto digitado pelo usuário em centavos. Aceita os formatos
 * comuns de entrada em PT-BR: "1.500", "1500,50", "R$ 1.500,00", "1500".
 * Retorna `null` se o texto não contiver nenhum dígito.
 */
export function parseCents(input: string): number | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  // Remove tudo que não é dígito, vírgula, ponto ou sinal de menos.
  let cleaned = trimmed.replace(/[^\d,.-]/g, '')
  if (!/\d/.test(cleaned)) return null

  const isNegative = cleaned.startsWith('-')
  cleaned = cleaned.replace(/-/g, '')

  const hasComma = cleaned.includes(',')
  const hasDot = cleaned.includes('.')

  let normalized: string
  if (hasComma && hasDot) {
    // "1.500,50" -> ponto é separador de milhar, vírgula é decimal.
    normalized = cleaned.replace(/\./g, '').replace(',', '.')
  } else if (hasComma) {
    // "1500,50" -> vírgula é decimal.
    normalized = cleaned.replace(',', '.')
  } else if (hasDot) {
    // Ambíguo: "1.500" (milhar) vs "1500.50" (decimal). Se houver
    // exatamente 3 dígitos após o último ponto E mais de um grupo,
    // tratamos como separador de milhar; senão, como decimal.
    const parts = cleaned.split('.')
    const last = parts[parts.length - 1]
    const looksLikeThousands = parts.length > 1 && last.length === 3
    normalized = looksLikeThousands ? parts.join('') : cleaned
  } else {
    normalized = cleaned
  }

  const value = Number.parseFloat(normalized)
  if (Number.isNaN(value)) return null

  const cents = Math.round(value * 100)
  return isNegative ? -cents : cents
}

export function sumCents(values: number[]): number {
  return values.reduce((total, value) => total + value, 0)
}
