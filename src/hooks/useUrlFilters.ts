import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'

export type UrlFilterValue = string | string[] | undefined

/**
 * Sincroniza um objeto de filtros com a query string, para que eles
 * sobrevivam a reload e possam ser linkados (ex.: KPI do Dashboard que
 * abre `/leads?followup=1`). `defaults` define as chaves esperadas e se
 * cada uma é escalar (string) ou múltipla (string[]).
 */
export function useUrlFilters<T extends Record<string, UrlFilterValue>>(
  defaults: T,
): [T, (patch: Partial<T>) => void] {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo(() => {
    const result = { ...defaults }
    for (const key of Object.keys(defaults) as Array<keyof T>) {
      const k = key as string
      if (!searchParams.has(k)) continue
      const isArray = Array.isArray(defaults[key])
      result[key] = (isArray ? searchParams.getAll(k) : searchParams.get(k)) as T[typeof key]
    }
    return result
  }, [searchParams])

  const setFilters = useCallback(
    (patch: Partial<T>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        for (const [key, value] of Object.entries(patch)) {
          next.delete(key)
          if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
            continue
          }
          if (Array.isArray(value)) {
            for (const v of value) next.append(key, v)
          } else {
            next.set(key, String(value))
          }
        }
        return next
      })
    },
    [setSearchParams],
  )

  return [filters, setFilters]
}
