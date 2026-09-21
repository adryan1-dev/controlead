/**
 * Normalização e geração de links de contato. Sem integração com APIs
 * externas: apenas monta a URL correta a partir do que o usuário digitou.
 */

/** Extrai só os dígitos de um número de WhatsApp digitado livremente. */
export function normalizeWhatsapp(input: string): string {
  return input.replace(/\D/g, '')
}

/**
 * Monta a URL do wa.me. Se o número tiver 10 ou 11 dígitos (DDD + número,
 * padrão brasileiro sem código do país), prefixa "55" automaticamente.
 */
export function whatsappUrl(input: string): string | null {
  const digits = normalizeWhatsapp(input)
  if (!digits) return null
  const withCountryCode = digits.length === 10 || digits.length === 11 ? `55${digits}` : digits
  return `https://wa.me/${withCountryCode}`
}

/**
 * Extrai o handle do Instagram a partir de @handle, handle puro, ou uma
 * URL colada (https://instagram.com/handle/?foo=bar).
 */
export function normalizeInstagram(input: string): string {
  const trimmed = input.trim()
  const urlMatch = trimmed.match(/instagram\.com\/([^/?#]+)/i)
  if (urlMatch) return urlMatch[1]
  return trimmed.replace(/^@/, '')
}

export function instagramUrl(input: string): string | null {
  const handle = normalizeInstagram(input)
  if (!handle) return null
  return `https://instagram.com/${handle}`
}

/** Garante que a URL do site tenha protocolo, prefixando https:// se faltar. */
export function websiteUrl(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}
