/** Normaliza texto para busca: minúsculas, sem acento. */
export function normalizeSearchText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

/** Verifica se `haystack` contém `needle`, ignorando acentos e caixa. */
export function matchesSearch(haystack: string | undefined | null, needle: string): boolean {
  if (!haystack) return false
  if (!needle.trim()) return true
  return normalizeSearchText(haystack).includes(normalizeSearchText(needle))
}

/** Verifica se algum dos campos combina com o termo de busca. */
export function matchesAny(fields: Array<string | undefined | null>, needle: string): boolean {
  if (!needle.trim()) return true
  return fields.some((field) => matchesSearch(field, needle))
}
